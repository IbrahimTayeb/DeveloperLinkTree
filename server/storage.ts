import { type User, type InsertUser, type Link, type InsertLink, type Analytics, type InsertAnalytics } from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
  
  // Link management
  getUserLinks(userId: string): Promise<Link[]>;
  getLink(id: string): Promise<Link | undefined>;
  createLink(link: InsertLink): Promise<Link>;
  updateLink(id: string, data: Partial<Link>): Promise<Link | undefined>;
  deleteLink(id: string): Promise<boolean>;
  
  // Analytics
  createAnalytic(analytic: InsertAnalytics): Promise<Analytics>;
  getUserAnalytics(userId: string): Promise<Analytics[]>;
  getLinkAnalytics(linkId: string): Promise<Analytics[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private links: Map<string, Link> = new Map();
  private analytics: Map<string, Analytics> = new Map();

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const user: User = {
      ...insertUser,
      id,
      password: hashedPassword,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getUserLinks(userId: string): Promise<Link[]> {
    return Array.from(this.links.values())
      .filter(link => link.userId === userId)
      .sort((a, b) => a.position - b.position);
  }

  async getLink(id: string): Promise<Link | undefined> {
    return this.links.get(id);
  }

  async createLink(insertLink: InsertLink): Promise<Link> {
    const id = randomUUID();
    const link: Link = {
      ...insertLink,
      id,
      createdAt: new Date(),
    };
    this.links.set(id, link);
    return link;
  }

  async updateLink(id: string, data: Partial<Link>): Promise<Link | undefined> {
    const link = this.links.get(id);
    if (!link) return undefined;
    
    const updatedLink = { ...link, ...data };
    this.links.set(id, updatedLink);
    return updatedLink;
  }

  async deleteLink(id: string): Promise<boolean> {
    return this.links.delete(id);
  }

  async createAnalytic(insertAnalytic: InsertAnalytics): Promise<Analytics> {
    const id = randomUUID();
    const analytic: Analytics = {
      ...insertAnalytic,
      id,
      timestamp: new Date(),
    };
    this.analytics.set(id, analytic);
    return analytic;
  }

  async getUserAnalytics(userId: string): Promise<Analytics[]> {
    return Array.from(this.analytics.values())
      .filter(analytic => analytic.userId === userId);
  }

  async getLinkAnalytics(linkId: string): Promise<Analytics[]> {
    return Array.from(this.analytics.values())
      .filter(analytic => analytic.linkId === linkId);
  }

  async verifyPassword(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }
}

export const storage = new MemStorage();
