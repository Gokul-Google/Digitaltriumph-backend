const mongoose = require('mongoose');

const ChatModelSchema = new mongoose.Schema({
  chatType: {
    type: String,   
    enum: ['staff', 'project'],
    required: true,
  },

    projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: function() {
      return this.chatType === 'project';
    },
  },
    sender: {   
    type: String,
    required: true,
    },

    text: {
    type: String,
    required: true,
    },  
    timestamp: {
    type: Date,
    default: Date.now,
    },
});     
module.exports = mongoose.model('ChatMessage', ChatModelSchema);

