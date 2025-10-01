

import { Story } from "../models/Story.js";
import cloudinary from "cloudinary";
import getDataUrl from "../utils/urlGenrator.js";
import { User } from "../models/User.js";
import Stripe from 'stripe';

 export const StoryCreate = async (req, res) => {

    try {
        
        const { name, content,price } = req.body;
        const file = req.file;
        const userId = req.user.id;
        const fileUrl = getDataUrl(file);

        if (!name || !content) {
            return res.status(400).json({
                message: "Title and Content are required"
            });
        }

        const  mycloud=await cloudinary.v2.uploader.upload(fileUrl.content,{
            folder:"stories"
        })
    
        const story = new Story({
            name,
            content,
            price,
            images: mycloud.secure_url,
            author: userId // <-- use _id from req.user
        });

    const createdStory = await story.save();
    res.status(201).json({
        message: "Story created successfully",
        story: createdStory
    });    

    } catch (error) {
        console.log(error);
    }}


//get all stories

export const getAllStories = async (req, res) => {
    try {
        const stories = await Story.find().populate("author", "username email");
        res.status(200).json({
            message: "Stories fetched successfully",
            stories
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
};


// singaleStory

export const getSingleStory = async (req, res) => {
    try {
        const storyId = req.params.id;
        const story = await Story.findById(storyId).populate("author", "username email");
   
        if (!story) {
            return res.status(404).json({
                message: "Story not found"
            });
        }

        res.status(200).json({
            message: "Story fetched successfully",
            story
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

//getMyStories
export const getMyStories = async (req, res) => {
    try {
        const userId = req.user.id;
        const stories = await Story.find({ author: userId }).populate("author", "username email").populate("baying");
        res.status(200).json({
            message: "My stories fetched successfully",
            stories
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
};


//book bay subscription
const stripe = new Stripe(process.env.Stripe_Secret_Key)

export const createCheckoutSession = async (req, res) => {
 try {
        const storyId = req.params.id;
        const userId = req.user._id; 

        const story = await Story.findById(storyId);
        if (!story || !story.price) {
            return res.status(404).json({ error: "Story not found or has no price." });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: story.name,
                        images: [story.images],
                    },
                    unit_amount: story.price * 100,
                },
                quantity: 1,
            }],
            mode: 'payment',
            client_reference_id: `${storyId}_${userId}`,
            // Append the session ID to the success URL
            success_url: `https://monumental-basbousa-dc5cd9.netlify.app/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `https://monumental-basbousa-dc5cd9.netlify.app/cancel`,
        });

        res.status(200).json({ url: session.url });


    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create checkout session." });
    }
};



//verify payment



import mongoose from 'mongoose';

export const verifyPayment = async (req, res) => {
    const { sessionId } = req.body;
   console.log(sessionId)
    if (!sessionId) {
        return res.status(400).json({ error: "Session ID is missing." });
    }

    try {
        // Retrieve the Stripe session directly using the session ID
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        // Verify the payment status and update your database
        if (session.payment_status === 'paid') {
            const [storyId, userId] = session.client_reference_id.split('_');
            console.log(storyId)
//client_reference_id
            // Find and update the story using the IDs from the session
            const updatedStory = await Story.findByIdAndUpdate(
                storyId,
                { $addToSet: { baying: new mongoose.Types.ObjectId(userId) } },
              
                { new: true }
            );

            const updateUser=await User.findByIdAndUpdate(
          userId,
                {$addToSet:{parscess:new mongoose.Types.ObjectId(storyId)}}


            )
            if (!updatedStory) {
                console.error(`Story with ID ${storyId} not found.`);
                return res.status(404).json({ success: false, message: "Story not found." });
            }

            console.log(`Payment verified. User ${userId} now has access to story ${storyId}.`);
            return res.status(200).json({ success: true, message: "Payment verified and story updated." });
        } else {
            return res.status(400).json({ success: false, message: "Payment was not successful." });
        }
    } catch (error) {
        console.error("Error during payment verification:", error);
        res.status(500).json({ success: false, message: "Failed to verify payment." });
    }
};
















