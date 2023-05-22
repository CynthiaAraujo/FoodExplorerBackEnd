const { hash } = require("bcryptjs");
const UserRepository = require("../repositories/UserRepository");

class UserAdmin {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async createAdminUser() {
    const adminUser = {
      name: "Admin",
      email: "admin@email.com",
      password: await hash("admin123", 10),
      isAdmin: true,
    };

    const createdAdminUser = await this.userRepository.create(adminUser);

    return createdAdminUser;
  }
}

module.exports = UserAdmin;
