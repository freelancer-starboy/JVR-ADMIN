import connectDb from "lib/database/db";
import mongoose from "mongoose";

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { id } = req.query;
  const Contact =
    mongoose.models.Contact ||
    new mongoose.model("Contact", new mongoose.Schema({}));

  try {
    await connectDb();

    // Find the contact by ID
    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    // If isOpened is already true, no update is necessary
    if (contact.isOpened === true) {
      return res.status(200).json({
        contactDetails: contact,
        message: "No changes made, status is already opened.",
      });
    }

    // Update isOpened to true
    const response = await Contact.findByIdAndUpdate(
      id,
      { isOpened: true },
      { new: true, strict: false } // 'new: true' to return the updated document
    );

    if (!response) {
      return res.status(404).json({ message: "Status not changed" });
    }

    return res.status(200).json({
      contactDetails: response,
      message: "Status changed successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
