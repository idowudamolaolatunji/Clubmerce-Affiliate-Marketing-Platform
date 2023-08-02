const crypto = require('crypto')

const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const slugify = require('slugify');

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, "Enter your full name"],
        maxLength: [40, "Full name must not be more than 40 characters"],
        minLength: [8, "Full name must not be more than 8 characters"],
    },
    username: {
        type: String,
        unique: [true, "Username must be unique"],
        trim: true,
        required: [true, "Enter a username"]
    },
    email: {
        type: String,
        required: [true, "A user account must have an email"],
        trim: true,
        unique: [true, "Email must be unique"],
        lowercase: true,
        validate: [validator.isEmail, "Enter a valid email"] 
    },
    password: {
        type: String,
        trim: true,
        required: [true, "Enter a password"],
        minLength: [8, "Password must not be less than 8 characters"],
        select: false,
    },
    // NEVER EVER STORE PLAN PASSWORD IN A DATABASE, ONLY ENCRYPTED
    passwordConfirm: {
        type: String,
        trim: true,
        required: [true, "Enter a password"],
        validate: {
            // validator only works on create or on save
            validator: function(el) {
                return el === this.password;
            },
            message: "Passwords are not the same"
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    country: String,
    phone: {
        type: String,
        trim: true
    },
    role: {
        type: String,
        enum: ['buyer', 'affiliate', 'vendor', 'admin'],
        default: "affiliate",
    },
    zipCode: String,
    businessName: {
        type: String,
        default: ''
    },
    region: String,
    image: {
        type: String,
        default: 'avatar.png'
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    slug: String,
    bankName: String,
    bankAccountNumber: Number,
    bankHolderName: String,
    active: {
        type: Boolean,
        default: true,
        select: false
    },
    wallet: {
        type: Number,
        default: 0,
    },
    clicks: {
        type: Number,
        default: 0,
    },
    transactions: {
        type: Number,
        default: 0
    },
    promotionLinksCounts: { type: Number, default: 0 },
    commissions: Number,
    affiliateLinks: [mongoose.Schema.Types.Mixed],
    productSold: {
        type: Number,
        default: 0
    },
    active: {
        type: Boolean,
        default: true,
    },
    socketId: String,
    createdAt: {
        type: Date,
        default: Date.now(),
    },
});

// PASSWORD SECURITY, USING THE EXPRESS PRE HOOK MIDDLEWARE
const saltRounds = 12;
userSchema.pre('save', async function(next) {
    // only run is password is not modified
    if(!this.isModified('password')) return next();

    // hash password with a cost of 12 salt rounds
    const hashedPassword = await bcrypt.hash(this.password, saltRounds);
    this.password = hashedPassword;

    // delete the confirmpassword field (undefined is best in objects)
    this.passwordConfirm = undefined;

    next();
});

userSchema.pre('save', function(next) {
    const slug = slugify(this.username, { lower: true });
    this.slug = `${slug}-${this._id}`;
    next();
})

userSchema.pre('save', function(next) {
    if(!this.isModified('Password') || this.isNew) 
        return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
})

// hide all inactive user
userSchema.pre(/^find/, function(next) {
    // this.find( { active: true } );
    this.find({ active: { $ne: false }});
    next();
});


userSchema.methods.comparePassword = async function(cnadidatePassword, hashedPassword) {
    return await bcrypt.compare(cnadidatePassword, hashedPassword);
}

userSchema.methods.changedPasswordAfter = function (jwtTimeStamp) {
    if(this.passwordChangedAt) {
        const changeTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return jwtTimeStamp < changeTimeStamp;
    }
    // return false means not changed
    return false;
}

userSchema.methods.createPasswordResetToken = function() {
    // create random bytes token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // simple hash random bytes token
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetToken = hashedToken;

    // create time limit for token to expire (10 mins)
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    return resetToken;
    // send the unencrypted version
}


const User = mongoose.model('User', userSchema);
module.exports = User;