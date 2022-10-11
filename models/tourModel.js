const mongoose = require('mongoose');
const slugify = require('slugify');

tourSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal then 40 characters'],
      minlength: [10, 'A tour name must have more or equal then 10 characters']
      // validate: [validator.isAlpha, 'Tour name must only contain characters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0']
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          // this only points to current doc on NEW document creation
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price'
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    },
    locations:[{
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'], // 'location.type' must be 'Point'
      },
      coordinates: {
        type: [Number]
      },
      address: String,
      description: String,
      day: Number
    }],
    guides: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users"
    }]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  });

tourSchema.index({duration: 1,price: -1});
tourSchema.index({locations: '2dsphere'});

tourSchema.virtual('durationToWeek').get(function () {
  return this.duration / 7;
});

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});

tourSchema.pre('save', async function(next) {
  this.slug = slugify(this.name,{
    lower: true
  });

  // const promise = this.guides.map(async id => await User.findById(id));
  // this.guides = await Promise.all(promise);

  next();
});

tourSchema.pre(/^find/, function(next) {
  this.find({
    secretTour: {$ne: true}
  })
  next();
});

tourSchema.pre('aggregate', function(next) {
  this.pipeline().unshift({
    $match: {
      secretTour: {$ne: true}
    }
  });
  console.log(this);
  next();
});

// tourSchema.post('save', function(doc,next) {
//   console.log('%s has been saved', doc._id);
// });

const Tour = mongoose.model('Tour',tourSchema);

module.exports = Tour;