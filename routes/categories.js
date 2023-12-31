import { Router } from "express";
import Category from "../models/Category.js";
import ProductCategory from "../models/ProductCategory.js";


const categoryRoute = Router()

categoryRoute.get("/", async (req, res) => {
try {
    const category = await Category.findAll();

    res.json(category);
} catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Internal Server Error in GET CATEGORY" });
}
});


categoryRoute.post("/", async (req, res) => {
try {
    const newCategory = req.body;
    const [category, built] = await Category.findOrBuild({
    where: {
        Name: newCategory.Name,
    },
    });

// only runs if no existing row matching query was found
    if (built) {
        await category.save();
    if (newCategory.products) {
        newCategory.products.forEach(async (product) => {
        await ProductCategory.findOrCreate({
            where: {
            product_id: product,
            category_id: newCategory.ID,
            },
        });
        });
    }

    res.json(category);
    } else {
    res.status(500).json({ error: "An Identical category already exists!" });
    }
} catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ error: "Internal Server Error CREATE CATEGORY" });
}
});

categoryRoute.put("/:id", async (req, res) => {
const newCategory = req.body;
try {
    const category = await Category.update(
    {
        Name: newCategory.Name,
    },
    {
        where: {
        ID: req.params.id,
        },
    }
    );

    res.json(category);
} catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ error: "Internal Server Error UPDATE CATEGORY" });
}
});

categoryRoute.delete("/:id", async (req, res) => {
try {
    const category = await Category.destroy({
    where: {
        ID: req.params.id,
    },
    });

    res.json(category);
} catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ error: "Internal Server Error DELETE CATEGORY" });
}
});

export default categoryRoute