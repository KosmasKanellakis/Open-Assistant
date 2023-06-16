/*
This code tests a function that updates a user's email.
The code starts by importing the "withoutRole", "isValidEmail", "prisma", and "handler" functions.
The code then mocks the "isValidEmail" and "prisma" functions.
The code then defines the "User email update handler" function.
The code then creates a mockRequest variable and sets it to an object.
The mockRequest object has a body property that is set to an object that has an email property.
The code then creates a mockResponse variable and sets it to an object.
The mockResponse object has a status property that is set to the jest.fn() function and a json property that is set to the jest.fn() function.
The code then enters a "beforeEach" function that will run before each test.
The code will then clear all mocks and set the mockRequest variable to an object.
The mockRequest object has a body property that is set to an object that has an email property.
The code will then set the mockResponse variable to an object.
The mockResponse object has a status property that is set to the jest.fn() function and a json property that is set to the jest.fn() function.
The code then enters an "afterEach" function that will run after each test.
The code will then clear all mocks.
The code then enters a "should return 400 status and 'Invalid email' message if the email is invalid" test.
The code will then mock the isValidEmail function and set it to return false.
The code will then call the handler function with the mockRequest and mockResponse variables.
The code will then check if the isValidEmail function was called with the "newemail@example.com" argument.
The code will then check if the mockResponse.status function was called with the 400 argument.
The code will then check if the mockResponse.json function was called with the "Invalid email" argument.
The code then enters a "should return 400 status and 'Invalid email' message if the email already exists" test.
The code will then mock the isValidEmail function and set it to return true.
The code will then mock the prisma.user.findFirst function and set it to return true.
The code will then call the handler function with the mockRequest and mockResponse variables.
The code will then check if the prisma.user.findFirst function was called with the "newemail@example.com" argument.
The code will then check if the mockResponse.status function was called with the 400 argument.
The code will then check if the mockResponse.json function was called with the "Invalid email" argument.
The code then enters a "should update the user's email and return the new email" test.
The code will then mock the isValidEmail function and set it to return true.
The code will then mock the prisma.user.findFirst function and set it to return false.
The code will then mock the prisma.user.update function and set it to return an object that has an email property.
The code will then call the handler function with the mockRequest and mockResponse variables.
The code will then check if the prisma.user.findFirst function was called with the "newemail@example.com" argument.
The code will then check if the prisma.user.update function was called with the "newemail@example.com" argument.
The code will then check if the mockResponse.json function was called with the "newemail@example.com" argument.
*/

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
