const mongoose = require('mongoose');

const blogSchema = mongoose.Schema(
    {
        title:{
            type:String,
            required:true,
            },
        content:{
            type:String,
            required:true,
        },
        image:{
            type:String,
            
            },
            // author:{
            //     type:String,
            //     // required:true,
            // },
            categories:{
                type:String,
                required:true,
            },    
              slug: {
      type: String,
      required: true,
      unique: true, // optional but recommended
    },
    categorySlug: {
      type: String,
      required: true,
    },
    },
    {timestamps: true}
);

module.exports  = mongoose.model('Blog', blogSchema)