import bcrypt from 'bcryptjs';

export default {
  async beforeCreate(event) {
    if (event.params.data.password) {
      event.params.data.password = await bcrypt.hash(
        event.params.data.password,
        10,
      );
    }
  },
  async beforeUpdate(event) {
    if (event.params.data.password) {
      event.params.data.password = await bcrypt.hash(
        event.params.data.password,
        10,
      );
    }
  },
};

