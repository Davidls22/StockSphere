const bcrypt = require('bcrypt');

const testPasswordHashing = async () => {
  const password = 'D1';
  const hashedPassword = '$2b$10$29BpSosjDOKqB7m9TBjLJOJDpY1ePvUSWm8yMNTZkDdhZjK./A0Wq'; // From the database

  const saltRounds = 10;

  // Hash the password manually
  const newHashedPassword = await bcrypt.hash(password, saltRounds);
  console.log('New Hashed Password:', newHashedPassword);

  // Compare the password with the stored hash
  const isMatch = await bcrypt.compare(password, hashedPassword);
  console.log('Password Match:', isMatch);
};

testPasswordHashing();
