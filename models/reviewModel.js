const mongoose = require('mongoose');
const Tour = require('./tourModel');

reviewSchema = new mongoose.Schema({
    text: {
        type: String,
        required: [true, 'A review must have a text']
    },
    rating: {
        type: Number,
        required: [true, 'A review must have a rating'],
        min: [1, 'Rating must be above 0'],
        max: [5, 'Rating must be less or equal 5'],
        default: 1
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    tour: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tour"
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    }
},
{
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

reviewSchema.index({tour: 1,user: 1},{unique: true});

reviewSchema.statics.calRatingAvg = async function(tourId) {
    const reviewRating = await this.aggregate([
        {
            $match: {tour: tourId}
        },
        {
            $group: {
                _id: '$tour',
                num: {$sum: 1},
                ratingAvg: {$avg: '$rating'}
            }
        }
    ]);
    
    await Tour.findByIdAndUpdate(tourId,{
        ratingsAverage: reviewRating[0].ratingAvg,
        ratingsQuantity: reviewRating[0].num
    });
}
reviewSchema.pre(/^find/, function(next) {
  
    this.populate({
      path: 'user'
    });
    next();
});

reviewSchema.post('save', async function() {
    this.constructor.calRatingAvg(this.tour);
})
reviewSchema.pre(/^findOneAnd/, async function(next) {
    this.r = await this.findOne();
    next();
})
reviewSchema.post(/^findOneAnd/, async function() {
    this.r.constructor.calRatingAvg(this.r.tour);
})
const Review = mongoose.model('Review',reviewSchema);

module.exports = Review;