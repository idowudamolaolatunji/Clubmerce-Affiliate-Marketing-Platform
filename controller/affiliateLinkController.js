const app = require('../app');
const User = require('../model/usersModel');
const Product = require('../model/productsModel');
const AffiliateLink = require('../model/affiliteLinkModel');

exports.createAffiliateLink = async (req, res) => {
  try {
    const { username } = req.body;
    console.log(req.params.productSlug, 'slug')
    if(username.length < 1) return res.status(400).json({ message: 'Please provide your username..' });

    // Find the user and product
    const user = await User.findOne({ username });
    const product = await Product.findOne({ slug: req.params.productSlug });
    if(!user) return res.status(400).json({ message: 'Enter a valid user...' });
    console.log(user, product)

    // Generate the affiliate promotion link
    const promotionLink = `https://clubmerce.com/unique_/${user.slug}/${product.slug}`;
    // const promotionLink = `${req.protocol}://${req.get('host')}/unique_/${user.slug}/${product.slug}`

    const gravity = await AffiliateLink.find({ product: product._id });
    product.productGravity = gravity.length + 1;
    await product.save({});

    // Check if link already exist and then create link and update links array
    if(!user.affiliateLinks.includes(promotionLink)) {
      // create link
        const newLinkDetails = await AffiliateLink.create({
            affiliate: user._id,
            product: product._id,
            link: promotionLink,
        });

        // add links to link arrays
        user.affiliateLinks.push(newLinkDetails.link);
        user.promotionLinksCounts = user.affiliateLinks.length;
        await user.save({ validateBeforeSave: false })
        res.json({ status: 'success', link: promotionLink });
    } else {
        return res.json({message: 'Url already exist', link: promotionLink})
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


exports.countClicksRedirects = async (req, res) => {
  try {
    const { userSlug, productSlug } = req.params;

    const user = await User.findOne({ slug: userSlug});
    const product = await Product.findOne({ slug: productSlug});

    if(!user || !product) return res.status(400).json({ message: 'User or product not found..' });

    // Find the affiliate link and update the click count and also both user, product
    await AffiliateLink.findOneAndUpdate(
        { affiliate: user._id, product: product._id },
        { $inc: { clicks: 1 } },
        { new: true }
    )

    product.clicks++;
    user.clicks++;
    await Promise.all([product.save({ validateBeforeSave: false }), user.save({ validateBeforeSave: false })]);
    
    res.redirect(`/buyers/order-product/${user.username}/${productSlug}`);
    // create a route that renders a product order page on /order/username:productSlug, as the product order page

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

exports.getAllLinks = async (req, res) => {
  try {
    const affLinks = await AffiliateLink.find();

    res.status(200).json({
      status: 'success',
      count: affLinks.length,
      data: {
        affLinks
      }
    })
  } catch(err) {
    res.status(400).json({
      status: 'fail',
      message: 'error'
    })
  }
}
