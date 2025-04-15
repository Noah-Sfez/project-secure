import supabase from "../supabaseClient.js";
import axios from "axios";
import fs from "fs";
import path from "path";
import multer from "multer";

export const createProduct = async (req, res) => {
    try {
        const { name, price } = req.body;

        if (!name || !price) {
            return res.status(400).json({
                error: "Merci de fournir un nom et un prix pour le produit.",
            });
        }

        const graphqlQuery = {
            query: `
        mutation productCreate($input: ProductInput!) {
          productCreate(input: $input) {
            product {
              id
              title
              
            }
            userErrors {
              field
              message
            }
          }
        }
      `,
            variables: {
                input: {
                    title: name,
                    variants: [{ price: price.toString() }],
                },
            },
        };

        const shopifyResponse = await axios.post(
            `https://${process.env.SHOPIFY_SHOP_NAME}.myshopify.com/admin/api/2023-04/graphql.json`,
            graphqlQuery,
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-Shopify-Access-Token":
                        process.env.SHOPIFY_ADMIN_ACCESS_TOKEN,
                },
            }
        );

        const responseData = shopifyResponse.data;

        const userErrors = responseData.data.productCreate.userErrors;
        if (userErrors.length > 0) {
            return res.status(400).json({ error: userErrors[0].message });
        }

        const shopifyGID = responseData.data.productCreate.product.id;
        const shopifyProductId = shopifyGID.split("/").pop();

        const { data, error } = await supabase
            .from("products")
            .insert([
                { shopify_id: shopifyProductId, created_by: req.user.id },
            ]);

        if (error) {
            console.error("Erreur Supabase:", error);
            return res
                .status(500)
                .json({ error: "Erreur lors de l'enregistrement du produit." });
        }

        res.status(201).json({
            message: "Produit créé avec succès 🚀",
            shopifyProductId,
            data,
        });
    } catch (error) {
        console.error(
            "Erreur création produit:",
            error.response?.data || error.message
        );
        res.status(500).json({
            error: "Erreur lors de la création du produit Shopify.",
        });
    }
};

export const createProductWithImage = async (req, res) => {
    try {
        const { name, price, image } = req.body;
        const userId = req.user.id;

        if (!name || !price) {
            return res.status(400).json({
                error: "Nom, prix requis",
            });
        }

        // 🔄 Lire l'image en base64
        const imagePath = path.join("uploads", req.file.filename);
        const imageBuffer = fs.readFileSync(req.file.path);
        const base64Image = `data:${
            req.file.mimetype
        };base64,${imageBuffer.toString("base64")}`;
        console.log("Image lue en base64:", base64Image);
        const base64Clean = base64Image.replace(/^data:image\/\w+;base64,/, "");
        // 🧠 Préparer la requête GraphQL pour Shopify
        const graphqlQuery = {
            query: `
              mutation productCreate($input: ProductInput!) {
                productCreate(input: $input) {
                  product {
                    id
                    title
                    images (first: 1 ) {
                edges {
                    node {
                        id
                        originalSrc
                    }
                        }
                    }
                  }
                  userErrors {
                    field
                    message
                  }
                }
              }
            `,
            variables: {
                input: {
                    title: name,
                    variants: [{ price: price.toString() }],
                    ...(image && {
                        images: [
                            {
                                attachment: base64Clean,
                            },
                        ],
                    }),
                },
            },
        };

        const shopifyResponse = await axios.post(
            `https://${process.env.SHOPIFY_SHOP_NAME}.myshopify.com/admin/api/2023-04/graphql.json`,
            graphqlQuery,
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-Shopify-Access-Token":
                        process.env.SHOPIFY_ADMIN_ACCESS_TOKEN,
                },
            }
        );

        const responseData = shopifyResponse.data;

        const userErrors = responseData.data.productCreate.userErrors;
        if (userErrors.length > 0) {
            return res.status(400).json({ error: userErrors[0].message });
        }

        const shopifyGID = responseData.data.productCreate.product.id;
        const shopifyProductId = shopifyGID.split("/").pop();

        // 💾 Enregistrer dans Supabase
        const { error } = await supabase.from("products").insert([
            {
                shopify_id: shopifyProductId,
                created_by: userId,
            },
        ]);

        if (error) throw error;

        res.status(201).json({
            success: true,
            message: "Produit avec image ajouté à Shopify et enregistré ✅",
        });
    } catch (err) {
        console.error("Erreur produit avec image:", err);
        res.status(500).json({
            error: "Erreur lors de la création du produit avec image ❌",
        });
    }
};

export const getMyProducts = async (req, res) => {
    try {
        const userId = req.user.id;

        const { data: products, error } = await supabase
            .from("products")
            .select("*")
            .eq("created_by", userId);

        if (error) {
            console.error("Erreur récupération produits:", error);
            return res.status(500).json({
                error: "Erreur lors de la récupération des produits 🚫",
            });
        }

        res.status(200).json({ products });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur interne du serveur 🚫" });
    }
};

export const getAllProducts = async (req, res) => {
    try {
        const { data: products, error } = await supabase
            .from("products")
            .select("*");

        if (error) {
            console.error("Erreur récupération produits:", error);
            return res.status(500).json({
                error: "Erreur lors de la récupération des produits 🚫",
            });
        }

        res.status(200).json({
            message: "Produits récupérés avec succès 🚀",
            count: products.length,
            products,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur interne du serveur 🚫" });
    }
};
