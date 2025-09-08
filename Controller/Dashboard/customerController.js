const Customer = require("../../Model/Dashboard/customerModel.js");

const withCreator = (req) => {
  const { id: userId, adminId } = req.user || {};
  if (!userId && !adminId) return null;
  return adminId || userId;
};

const create = async (req, res) => {
  try {
    const creatorId = withCreator(req);
    if (!creatorId) return res.status(401).json({ message: "Authentication required." });

    const { name, phone, email, address, notes, birthday, category, discountPercentage, isActive } = req.body;
    if (!name) return res.status(400).json({ message: "name is required" });

    const doc = await Customer.create({
      createdBy: creatorId,
      name: String(name).trim(),
      phone: phone ? String(phone).trim() : undefined,
      email: email ? String(email).trim().toLowerCase() : undefined,
      address: address ? String(address).trim() : undefined,
      notes: notes ? String(notes).trim() : undefined,
      birthday: birthday ? new Date(birthday) : undefined,
      category: category ? String(category).trim() : undefined,
      discountPercentage: discountPercentage != null ? Number(discountPercentage) : undefined,
      isActive: typeof isActive === "boolean" ? isActive : undefined,
    });

    return res.status(201).json({ message: "Customer created", customer: doc });
  } catch (error) {
    console.error("Error creating customer:", error);
    return res.status(500).json({ errorMessage: error.message });
  }
};

const list = async (req, res) => {
  try {
    const creatorId = withCreator(req);
    if (!creatorId) return res.status(401).json({ message: "Authentication required." });

    const { q } = req.query;
    const query = { createdBy: creatorId };
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: "i" } },
        { phone: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ];
    }

    const customers = await Customer.find(query).sort({ updatedAt: -1 }).limit(500);
    return res.status(200).json(customers);
  } catch (error) {
    console.error("Error listing customers:", error);
    return res.status(500).json({ errorMessage: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const creatorId = withCreator(req);
    if (!creatorId) return res.status(401).json({ message: "Authentication required." });

    const { id } = req.params;
    const customer = await Customer.findOne({ _id: id, createdBy: creatorId });
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    return res.status(200).json(customer);
  } catch (error) {
    console.error("Error fetching customer:", error);
    return res.status(500).json({ errorMessage: error.message });
  }
};

const update = async (req, res) => {
  try {
    const creatorId = withCreator(req);
    if (!creatorId) return res.status(401).json({ message: "Authentication required." });

    const { id } = req.params;
    const allowed = ["name", "phone", "email", "address", "notes", "isActive", "birthday", "category", "discountPercentage"]; 
    const updateDoc = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updateDoc[key] = req.body[key];
    }
    if (updateDoc.birthday !== undefined) updateDoc.birthday = new Date(updateDoc.birthday);
    if (updateDoc.discountPercentage !== undefined) updateDoc.discountPercentage = Number(updateDoc.discountPercentage);

    const updated = await Customer.findOneAndUpdate(
      { _id: id, createdBy: creatorId },
      { $set: updateDoc },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Customer not found" });
    return res.status(200).json({ message: "Customer updated", customer: updated });
  } catch (error) {
    console.error("Error updating customer:", error);
    return res.status(500).json({ errorMessage: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const creatorId = withCreator(req);
    if (!creatorId) return res.status(401).json({ message: "Authentication required." });

    const { id } = req.params;
    const deleted = await Customer.findOneAndDelete({ _id: id, createdBy: creatorId });
    if (!deleted) return res.status(404).json({ message: "Customer not found" });
    return res.status(200).json({ message: "Customer deleted" });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return res.status(500).json({ errorMessage: error.message });
  }
};

module.exports = { create, list, getById, update, remove };
