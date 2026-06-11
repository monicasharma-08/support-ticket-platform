// server/routes/tickets.js
const express = require('express');
const { verifyToken, requireAgent } = require('../middleware/auth');
const Ticket = require('../models/Ticket');
const Comment = require('../models/Comment');

const router = express.Router();

/**
 * POST /tickets
 * Create a new support ticket
 * Triggers AI triage asynchronously
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, description } = req.body;
    const { triageTicket } = require('../services/aiTriage');

    // Validation
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title and description.',
      });
    }

    if (title.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Title must be at least 5 characters long.',
      });
    }

    if (description.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Description must be at least 10 characters long.',
      });
    }

    // Create ticket with basic info
    const ticket = new Ticket({
      title,
      description,
      createdBy: req.user.id,
      status: 'Open',
      history: [
        {
          action: 'created',
          performedBy: req.user.id,
          newValue: 'Open',
          timestamp: new Date(),
        },
      ],
    });

    await ticket.save();

    // AI triage runs asynchronously (don't wait for it)
    triageTicket(title, description)
      .then((triage) => {
        Ticket.findByIdAndUpdate(
          ticket._id,
          {
            category: triage.category,
            priority: triage.priority,
            suggestedResponse: triage.suggestedResponse,
          },
          { new: true }
        )
          .then((updated) => {
            console.log(`✅ Ticket ${ticket._id} auto-triaged: ${triage.category}, ${triage.priority}`);
          })
          .catch((err) => {
            console.error(`❌ Error updating ticket with triage: ${err.message}`);
          });
      })
      .catch((err) => {
        console.error(`❌ AI Triage failed: ${err.message}`);
      });

    // Populate before returning
    const populatedTicket = await Ticket.findById(ticket._id);

    res.status(201).json({
      success: true,
      message: 'Ticket created successfully. AI triage is processing...',
      data: populatedTicket,
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create ticket.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * GET /tickets
 * Get all tickets (agents see all, customers see only their own)
 * Supports filtering, searching, and pagination
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const {
      status,
      priority,
      category,
      assignee,
      search,
      limit = 10,
      skip = 0,
    } = req.query;

    // Build filter
    let filter = {};

    // Customers only see their own tickets
    if (req.user.role === 'customer') {
      filter.createdBy = req.user.id;
    }

    // Apply filters
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (assignee) filter.assignedTo = assignee;

    // Apply search
    if (search) {
      filter.$text = { $search: search };
    }

    // Execute query with pagination
    const tickets = await Ticket.find(filter)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .sort({ createdAt: -1 });

    const total = await Ticket.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: tickets,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tickets.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * GET /tickets/:id
 * Get a single ticket with comments
 */
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate('comments');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found.',
      });
    }

    // Customer can only view their own tickets
    if (req.user.role === 'customer' && ticket.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own tickets.',
      });
    }

    res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ticket.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * PATCH /tickets/:id
 * Update ticket status, priority, category, or assignment (agents only)
 */
router.patch('/:id', verifyToken, requireAgent, async (req, res) => {
  try {
    const { status, priority, category, assignedTo } = req.body;

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found.',
      });
    }

    // Track changes for history
    const updates = {};
    const historyEntry = {
      performedBy: req.user.id,
      timestamp: new Date(),
    };

    if (status && status !== ticket.status) {
      updates.status = status;
      historyEntry.action = 'status_changed';
      historyEntry.previousValue = ticket.status;
      historyEntry.newValue = status;
    }

    if (priority && priority !== ticket.priority) {
      updates.priority = priority;
    }

    if (category && category !== ticket.category) {
      updates.category = category;
    }

    if (assignedTo !== undefined) {
      updates.assignedTo = assignedTo || null;
      historyEntry.action = assignedTo ? 'assigned' : 'unassigned';
      historyEntry.newValue = assignedTo ? assignedTo : 'Unassigned';
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid updates provided.',
      });
    }

    // Add to history if there were actual changes
    if (historyEntry.action) {
      ticket.history.push(historyEntry);
    }

    // Apply updates
    Object.assign(ticket, updates);
    await ticket.save();

    const updated = await Ticket.findById(ticket._id);

    res.status(200).json({
      success: true,
      message: 'Ticket updated successfully.',
      data: updated,
    });
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update ticket.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * POST /tickets/:id/comments
 * Add a comment to a ticket
 */
router.post('/:id/comments', verifyToken, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required.',
      });
    }

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found.',
      });
    }

    // Customer can only comment on their own tickets
    if (req.user.role === 'customer' && ticket.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only comment on your own tickets.',
      });
    }

    // Create comment
    const comment = new Comment({
      ticket: req.params.id,
      author: req.user.id,
      text: text.trim(),
    });

    await comment.save();

    // Add comment to ticket
    ticket.comments.push(comment._id);
    await ticket.save();

    // Populate and return
    const populatedComment = await Comment.findById(comment._id);

    res.status(201).json({
      success: true,
      message: 'Comment added successfully.',
      data: populatedComment,
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * GET /tickets/:id/comments
 * Get all comments for a ticket
 */
router.get('/:id/comments', verifyToken, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found.',
      });
    }

    const comments = await Comment.find({ ticket: req.params.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: comments,
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch comments.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

module.exports = router;