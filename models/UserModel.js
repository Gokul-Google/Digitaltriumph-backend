const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    empId: {
  type: String,
  unique: true,
  sparse: true,
},
 clientId: {
  type: String,
  unique: true,
  sparse: true,
},
    name:{
        type: String,
        required: true,
    },
    email:
    {
        type: String,
        required: true,
        validate:{
            validator: function (v){
                return /\S+@\S+\.\S+/.test(v);
            },
            message: "Email must be in a valid format!"
        }
    },
    phone:
    {
        type: String,
        required: true,
        validate:{
            validator: function(v){
                return /^\d{10}$/.test(v);
            },message: "Phone number must be in 10 digit!"
        }
    },
    image:{
        type: String,
        default: null,
    },
    password:{
        type: String,
        required: true,
    },
  role: {
  type: String,
  enum: ["Staff","Manager/Hr","Client","Admin"],
  required: true,
},
    projectName:
    {
type:String,

    },
    staffRole: { 
  type: String,
  enum: ["FrontendDeveloper","BackendDeveloper","MobileDeveloper","UI-BlueprintDesign","DigitalMarketing"],
default: null,
required: function(){
    return this.role === "Staff";
}
},
},
{timestamps:true}
)


module.exports = mongoose.model('User', userSchema);