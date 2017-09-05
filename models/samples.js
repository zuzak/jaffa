var mongoose = require('mongoose')
var shuffle = require('array-shuffle')

var schema = new mongoose.Schema({
  brand: String,
  price: Number,
  pricePer: Number,
  sampleIdentifier: {type: String, index: {unique: true}},
  allergens: Array,
  mayContain: Array,
  description: String,
  image: String
})

var jaffaCakes = [ // these aren't the order they are in the app
  {
    brand: 'Aldi Belmont',
    description: 'Sponge base with an orange flavoured filling and a plain chocolate topping',
    price: 0.89,
    pricePer: 24,
    allergens: [ 'Soya', 'Egg', 'Wheat'],
    mayContain: [ 'Nuts', 'Milk' ],
    image: 'https://i.imgur.com/knmRDCtm.png'
  },
  {
    brand: 'Lidl',
    description: 'Mini sponge cakes with 55% orange flavoured jelly centre, topped with 17% dark chocolate',
    price: 0.89,
    pricePer: 24,
    allergens: [ 'Wheat', 'Egg  ', 'Soya', 'Milk'],
    mayContain: [],
    image: 'https://i.imgur.com/xr8Ibdjm.png'
  },
  {
    brand: 'Tesco',
    description: 'Golden sponge base with an orange flavoured centre, half coated in plain chocolate',
    price: 0.95,
    pricePer: 24,
    allergens: [ 'Wheat', 'Egg', 'Soya'],
    image: 'https://i.imgur.com/xFvSfFbm.jpg',
    mayContain: ['Milk']
  },
  {
    brand: 'McVitie\'s',
    description: 'Light sponge cakes with dark crackly chocolate and a smashing orangey centre',
    price: 1.00,
    pricePer: 24,
    allergens: ['Milk', 'Soya', 'Wheat', 'Egg'],
    mayContain: [],
    image: 'https://i.imgur.com/keBmXog.jpg'
  },
  {
    brand: 'Morrisons',
    description: 'Sponge biscuit with orange fruit filling (55%) and dark chocolate',
    price: 0.96,
    pricePer: 24,
    allergens: ['Soya', 'Wheat', 'Egg'],
    mayContain: ['Milk', 'Nuts'],
    image: 'https://i.imgur.com/Px0jJo9m.png'
  },
  {
    brand: 'M&S',
    description: 'Sponge cakes topped with orange filling and half coated in dark chocolate',
    price: 1.00,
    pricePer: 11, // eleven(!)
    allergens: ['Milk', 'Wheat', 'Egg', 'Soya'],
    mayContain: ['Nuts'],
    image: 'https://i.imgur.com/mWeLQosm.png'
  },
  {
    brand: 'Morrisons Savers',
    description: 'Sponge biscuit with orange fruit filling (55%) and dark chocolate',
    allergens: ['Soya', 'Wheat', 'Egg'],
    mayContain: ['Milk', 'Nuts'],
    price: 0.38,
    pricePer: 12,
    image: 'https://i.imgur.com/fZPmdGK.jpg'
  },
  {
    brand: 'Bahlsen Messino',
    description: 'Luxury sponge cakes with a tangy orange fruit filling (53%) half-coated in dark chocolate (19%)',
    allergens: ['Wheat', 'Egg', 'Whey', 'Soya', 'Milk'],
    mayContain: ['Hazelnuts'],
    pricePer: 11,
    image: 'https://i.imgur.com/yUq7oYom.png',
    price: 1.19
  },
  {
    brand: 'Aldi Everyday Essentials',
    price: 0.31,
    pricePer: 12,
    description: 'Sponge base with an orange flavoured centre half coated in plain chocolate',
    allergens: [ 'Wheat', 'Egg', 'Soya'],
    mayContain: [ 'Milk'],
    image: 'https://i.imgur.com/fW4pjbc.jpg'
  },
  {
    brand: 'Tango',
    price: 0.89,
    pricePer: 24,
    description: 'Sponge cakes with a tangy orange filling topped with real chocolate',
    allergens: [ 'Soya', 'Wheat', 'Egg'],
    mayContain: ['Nuts', 'Milk'],
    image: 'https://i.imgur.com/sYWLiuJm.jpg'
  },
  {
    brand: 'Asda Smart Price',
    pricePer: 12,
    price: 0.31,
    description: 'Sponge cakes with an orange-flavoured filling, topped with dark chocolate',
    allergens: [ 'Soya', 'Wheat', 'Egg'],
    mayContain: [ 'Milk' ],
    image: 'https://i.imgur.com/MdzWFnqm.jpg'
  },
  {
    brand: 'Sainsbury\'s',
    price: 1.55,
    pricePer: 36,
    description: 'Dark chocolate topped sponge cakes with orange flavoured filling',
    allergens: [ 'Soya', 'Wheat', 'Egg'],
    mayContain: [ 'Milk' ],
    image: 'https://i.imgur.com/39xBf32m.png'
  },
  {
    brand: 'Asda',
    description: 'Sponge cakes with an orange-flavoured filling, topped with dark chocolate',
    price: 0.60,
    pricePer: 12,
    allergens: [ 'Soya', 'Wheat', 'Egg'],
    mayContain: ['Milk'],
    image: 'https://i.imgur.com/CStg7rSm.jpg'
  },
  {
    brand: 'Sainsbury\'s Basics',
    pricePer: 12,
    allergens: ['Soya', 'Wheat', 'Egg'],
    mayContain: ['Milk'],
    price: 0.60,
    description: 'Sponge cakes with an orange flavoured centre half coated in dark chocolate',
    image: 'https://i.imgur.com/qXMwSfgm.png'
  },
  {
    brand: 'Newsagents\'',
    pricePer: 32, // estimate (marked as 400g)
    allergens: [ 'Milk', 'Soya', 'Gluten', 'Egg', 'Sodium Metabisulphite'],
    mayContain: ['Nuts'],
    price: 1.00,
    description: '',
    image: 'https://i.imgur.com/EwAqBxWm.jpg'
  },
  {
    brand: 'Milka',
    pricePer: 12,
    allergens: ['Wheat', 'Eggs', 'Milk', 'Hazelnuts' ],
    mayContain: [ 'Other Nuts' ],
    description: 'Biszkopty z galaretka o smaku pomaraṅczowym (52%) oblewane czrkoladą mleczną z mleka alpjskiego (15%)',
    image: 'https://i.imgur.com/Ne1L0hKm.png',
    price: 1.00
  },
  {
    brand: 'Delicje',
    pricePer: 10,
    allergens: [ 'Wheat', 'Eggs'],
    mayContain: [ 'Milk', 'Nuts' ],
    price: 1.00, // est
    description: 'Biskopty z galareką pomaraṅczowa (52%) olewane czekoladą (15%)'
  },
  {
    brand: 'Dr Gerard',
    pricePer: 24, // est
    allergens: ['Wheat', 'Egg', 'Milk', 'Soybeans'],
    mayContain: ['Peanuts', 'Sesame', 'other nuts'],
    description: 'Biszkopty z nadzieniem o smaku morelowym w polewie kakaowej',
    price: 1.59,
    image: 'https://i.imgur.com/9ei6Qrem.png'
  }

]

var Sample = module.exports = mongoose.model('Sample', schema)

Sample.find({}, function (err, response) {
  if (err) throw err
  // if (response.length < jaffaCakes.length) {
    // jaffaCakes = shuffle(jaffaCakes)
  for (var i = 0; i < jaffaCakes.length; i++) {
    var c = jaffaCakes[i]
        // c.sampleIdentifier = String.fromCharCode(65 + i) // 64 == 'A'
    Sample.update({
      brand: c.brand
    }, c, {upsert: true}, function (err) {
      if (err) throw err
    })
  }
 // }
})
