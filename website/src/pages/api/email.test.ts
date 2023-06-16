import { withoutRole } from "src/lib/auth";
import { isValidEmail } from "src/lib/email_validation";
import prisma from "src/lib/prismadb";
import handler from "./email";

jest.mock("src/lib/email_validation");
jest.mock("src/lib/prismadb");

describe("User email update handler", () => {
  let mockRequest: any;
  let mockResponse: any;

  beforeEach(() => {
    mockRequest = {
      body: {
        email: "newemail@example.com",
      },
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 status and 'Invalid email' message if the email is invalid", async () => {
    (isValidEmail as jest.Mock).mockReturnValue(false);

    await handler(mockRequest, mockResponse);

    expect(isValidEmail).toHaveBeenCalledWith("newemail@example.com");
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: "Invalid email" });
  });

  it("should return 400 status and 'Invalid email' message if the email already exists", async () => {
    (isValidEmail as jest.Mock).mockReturnValue(true);
    (prisma.user.findFirst as jest.Mock).mockResolvedValue(true);

    await handler(mockRequest, mockResponse);

    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: {
        email: "newemail@example.com",
      },
    });
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: "Invalid email" });
  });

  it("should update the user's email and return the new email", async () => {
    (isValidEmail as jest.Mock).mockReturnValue(true);
    (prisma.user.findFirst as jest.Mock).mockResolvedValue(false);
    (prisma.user.update as jest.Mock).mockResolvedValue({ email: "newemail@example.com" });

    await handler(mockRequest, mockResponse);

    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: {
        email: "newemail@example.com",
      },
    });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: {
        id: expect.anything(), // You can use expect.anything() as the token.sub is not used in the code
      },
      data: {
        email: "newemail@example.com",
      },
    });
    expect(mockResponse.json).toHaveBeenCalledWith({ newmail: "newemail@example.com" });
  });
});
