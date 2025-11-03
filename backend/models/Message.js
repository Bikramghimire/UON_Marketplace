import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Message must have a sender']
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Message must have a recipient']
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: false // Optional - message can be about a product or general
  },
  subject: {
    type: String,
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true
  },
  // Meeting details (optional)
  meetingDate: {
    type: Date
  },
  meetingTime: {
    type: String, // Store time as string (e.g., "14:30")
    trim: true
  },
  meetingLocation: {
    name: {
      type: String, // Address or location name
      trim: true
    },
    coordinates: {
      lat: {
        type: Number
      },
      lng: {
        type: Number
      }
    }
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
messageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
messageSchema.index({ recipient: 1, read: 1, createdAt: -1 });
messageSchema.index({ product: 1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;

