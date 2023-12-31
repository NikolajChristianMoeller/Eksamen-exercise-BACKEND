import express from "express";
import cors from "cors";
import "dotenv/config";
import Collection from "./models/Collection.js";
import sequelize from "./models/Sequalize.js";
import Color from "./models/Color.js";
import Product from "./models/Product.js";
import ProductCollection from "./models/ProductCollection.js";
import ProductColor from "./models/ProductColor.js";
import Review from "./models/Review.js";
import Category from "./models/Category.js";
import ProductCategory from "./models/ProductCategory.js";
import productRoute from "./routes/products.js";
import colorRoute from "./routes/colors.js";
import collectionRoute from "./routes/collections.js";
import categoryRoute from "./routes/categories.js";
import reviewRoute from "./routes/review.js";
import { createTransport } from "nodemailer";



const app = express();
app.use(express.json());
app.use(cors());
const pEnv = process.env;

const PORT = pEnv.PORT | 8080;

// Define associations between the models:

//Defining tables relation to their junction tables
ProductColor.associate = () => {
  ProductColor.belongsTo(Product, {
    foreignKey: "ID",
    targetKey: "product_id",
    as: "Product",
  });
  ProductColor.belongsTo(Color, {
    foreignKey: "Code",
    targetKey: "color_id",
    as: "Color",
  });
};

ProductCollection.associate = () => {
  ProductCollection.belongsTo(Product, {
    foreignKey: "ID",
    targetKey: "product_id",
    as: "Product",
  });
  ProductCollection.belongsTo(Collection, {
    foreignKey: "ID",
    targetKey: "collection_id",
    as: "Collection",
  });
};

ProductCategory.associate = () => {
  ProductCategory.belongsTo(Product, {
    foreignKey: "ID",
    targetKey: "product_id",
    as: "Product",
  });
  ProductCategory.belongsTo(Category, {
    foreignKey: "ID",
    targetKey: "category_id",
    as: "Category",
  });
};


//Define many to many relations between tables 
Product.belongsToMany(Category, {
  as: "Categories",
  through: ProductCategory,
  foreignKey: "product_id",
});
Category.belongsToMany(Product, {
  as: "ProductCategory",
  through: ProductCategory,
  foreignKey: "category_id",
});

Product.belongsToMany(Color, {
  as: "Colors",
  through: ProductColor,
  foreignKey: "product_id",
});
Color.belongsToMany(Product, {
  as: "ProductColor",
  through: ProductColor,
  foreignKey: "color_id",
});

Product.belongsToMany(Collection, {
  as: "Collections",
  through: ProductCollection,
  foreignKey: "product_id",
});
Collection.belongsToMany(Product, {
  as: "ProductCollection",
  through: ProductCollection,
  foreignKey: "collection_id",
});

//one to many
Product.hasMany(Review);
Review.belongsTo(Product);

// Sync the models with the database
async function syncDatabase(bool) {
  try {
    await sequelize.sync({force: bool}); // If { force: true } this will wipe database and recreate tables (should only be used if changes are made to the schemas)
    console.log("Database synchronized");
  } catch (error) {
    console.error("Error syncing database:", error);
  }
}

// ROUTES //

app.use("/products", productRoute);

app.use("/colors", colorRoute);

app.use("/collections", collectionRoute);

app.use("/categories", categoryRoute);

app.use("/reviews", reviewRoute)


//Used to create routes in frontend so all products have their own route through their id
app.get("/keys", async (req, res) =>{
  try {
    let product;
      product = await Product.findAll({
        attributes: ["ID"]     
      });  
    res.json(product);
  } catch (error) {
    console.error("Error fetching product IDs:", error);
    res.status(500).json({ error: "Error getting product IDs" });
  }
})

//default route checks if database table matches the tables in the code
app.get("/", async (req, res)=>{
  await syncDatabase(false);
  res.send("Database Sync successful")
})

//route for sending order confirmations through email
//nodemailer + gmail used to achieve this

app.post("/mail", async (req, res)=>{
  try {
// define service + credentials for nodemailer to use
    const transport = createTransport({
      service: "gmail",
      auth: {
          user: pEnv.GMAIL_USER,
          pass: pEnv.GMAIL_PASS
      }  
  })
  

// set mail content (gets the actual content from frontend)
  const content = {
      from: "noreplymikrohome@gmail.com",
      to: req.body.mailTo,
      subject: `Ordrebekræftelse ${req.body.orderNum}`,
      text: req.body.message
  }
  
  transport.sendMail(content, (err, res)=>{
      if(err){
        throw new Error("error sending mail"+ err)
      }
  })
  res.send("Mail sent");
  } catch (error) {
    console.log(error)
    res.status(500).json({error: "Error while sending mail!"})
  }
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
