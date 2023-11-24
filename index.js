import express from 'express';
import { Sequelize, DataTypes } from 'sequelize';

const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));


app.use(express.static('public'));

////////////////////////////////////////////////// Connection///////////////////////////////////////////////////////////////////

const connection = new Sequelize({
  dialect: 'sqlite',
  storage: './coffee-shop.db',
  logging: false
});

////////////////////////////////////////////////// Connection///////////////////////////////////////////////////////////////////

// Check the database connection
connection.authenticate()
  .then(() => {
    console.log('Successfully connected to the database');
  })
  .catch((error) => {
    console.log(error);
  });

////////////////////////////////////////////////// Model///////////////////////////////////////////////////////////////////
//coffee//
const coffeeSchema = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement:true
  },
  name: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  image: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false 
  },
};
//contact//
const contactSchema = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  email: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
};

const Contact = connection.define('contact', contactSchema, { timestamps: false, freezeTableName: true });
const Coffee = connection.define('coffee', coffeeSchema, { timestamps: false, freezeTableName: true });

connection.sync();

////////////////////////////////////////////////// Routes///////////////////////////////////////////////////////////////////


// Route to render the add-coffee form

app.get('/add-coffee', (req, res) => {
  res.render('add-coffee', { image: '' }); 
});

app.get('/delete-coffee/:id', (req, res) => {
  const coffeeId = req.params.id;

  // delete the coffee with the specified id
  Coffee.destroy({ where: { id: coffeeId } })
    .then(() => {
      res.send(`Coffee with id ${coffeeId} deleted successfully`);
    })
    .catch((error) => {
      console.error('Error deleting coffee:', error);
      res.status(500).send('An error occurred while deleting the coffee');
    });
});
// Route to handle the form submission and create a new coffee entry
app.post('/add-coffee', async (req, res) => {
  const { name, description, image, price } = req.body;

  // Validate request body
  if (!name || !description || !image || !price) {
    return res.status(400).send('Missing required fields');
  }

  try {
    await Coffee.create({ name, description, image ,price });
    res.redirect('/');
  } catch (error) {
    console.log(error);
    res.status(500).send(`Error adding coffee entry: ${error.message}`);
  }
});
app.get('/edit-coffee/:id', (req, res) => {
  // Extract the coffee ID from req.params
  const { id } = req.params;

  // Use the Coffee model to find the coffee in the database
  Coffee.findOne({ where: { id } })
    .then((coffee) => {
      if (coffee) {
        // Render the 'edit-coffee' view, passing the coffee data
        res.render('edit-coffee', { coffee });
      } else {
        // If no coffee was found, send a 404 error
        res.status(404).send('Coffee not found');
      }
    })
    .catch((err) => {
      res.status(500).send(err.message);
    });
});
app.post('/edit-coffee/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, image , price } = req.body;

  Coffee.update({ name, description, image, price }, { where: { id } })
    .then(() => {
      res.redirect('/');
    })
    .catch((err) => {
      res.status(500).send(err.message);
    });
});
//user page 
app.get('/user', (req, res) => {
  // Get the coffee items from your database
  Coffee.findAll().then(coffees => {
    // Render the user view with the coffee items
    res.render('user', { coffees: coffees });
  }).catch(err => {
    console.log(err);
  });
});

//contact  route 

app.post('/contact', (req, res) => {
  Contact.create({
    name: req.body.name,
    email: req.body.email,
    message: req.body.message
  }).then(contact => {
    res.send('Thank you for your message. We will get back to you soon.');
  }).catch(err => {
    console.log(err);
    res.send('Sorry, there was an error. Please try again later.');
  });
});




// Route to render the home page with the list of coffees
app.get('/', async (req, res) => {
  try {
    const coffees = await Coffee.findAll();
    res.render('main', { coffees });
  } catch (error) {
    console.log(error);
    res.status(500).send('Error retrieving coffee data');
  }
});



app.listen(5500, () => {
  console.log('Server is running on port 5500');
});