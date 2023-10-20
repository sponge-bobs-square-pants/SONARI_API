const FormEntry = require('../FormEntry');

const formDataEntry = async (req, res) => {
    try {
      const formData = req.body;
      const formEntry = new FormEntry(formData);
      await formEntry.save();
  
      res.json({ message: 'Form submitted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while submitting the form' });
    }
  }


module.exports = {
    formDataEntry
}