export class UserRepository {
  async findById(userId: string) {
    return {
      id: userId,
      name: "John Doe",
      email: "john.doe@example.com",
    };
  }
}
