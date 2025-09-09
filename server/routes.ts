import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { loginSchema, registerSchema, insertLinkSchema } from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Middleware to verify JWT token
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingEmail = await storage.getUserByEmail(data.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already registered" });
      }
      
      const existingUsername = await storage.getUserByUsername(data.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }

      const user = await storage.createUser({
        email: data.email,
        password: data.password,
        displayName: data.displayName,
        username: data.username,
        bio: "",
        avatar: "",
        theme: "gradient",
      });

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
      
      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          username: user.username,
          bio: user.bio,
          avatar: user.avatar,
          theme: user.theme,
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      
      const user = await storage.verifyPassword(data.email, data.password);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
      
      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          username: user.username,
          bio: user.bio,
          avatar: user.avatar,
          theme: user.theme,
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User profile routes
  app.get("/api/users/profile", authenticateToken, async (req: any, res) => {
    res.json({
      id: req.user.id,
      email: req.user.email,
      displayName: req.user.displayName,
      username: req.user.username,
      bio: req.user.bio,
      avatar: req.user.avatar,
      theme: req.user.theme,
    });
  });

  app.put("/api/users/profile", authenticateToken, async (req: any, res) => {
    try {
      const { displayName, bio, username, theme } = req.body;
      
      // Check if username is taken by another user
      if (username && username !== req.user.username) {
        const existing = await storage.getUserByUsername(username);
        if (existing) {
          return res.status(400).json({ message: "Username already taken" });
        }
      }

      const updatedUser = await storage.updateUser(req.user.id, {
        displayName,
        bio,
        username,
        theme,
      });

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: updatedUser.id,
        email: updatedUser.email,
        displayName: updatedUser.displayName,
        username: updatedUser.username,
        bio: updatedUser.bio,
        avatar: updatedUser.avatar,
        theme: updatedUser.theme,
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Public profile route
  app.get("/api/users/:username", async (req, res) => {
    try {
      const { username } = req.params;
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const links = await storage.getUserLinks(user.id);
      
      // Track profile view
      await storage.createAnalytic({
        userId: user.id,
        linkId: null,
        type: 'view',
      });

      res.json({
        displayName: user.displayName,
        username: user.username,
        bio: user.bio,
        avatar: user.avatar,
        theme: user.theme,
        links: links.filter(link => link.isActive),
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Link management routes
  app.get("/api/links", authenticateToken, async (req: any, res) => {
    try {
      const links = await storage.getUserLinks(req.user.id);
      res.json(links);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/links", authenticateToken, async (req: any, res) => {
    try {
      const data = insertLinkSchema.parse({
        ...req.body,
        userId: req.user.id,
      });

      const link = await storage.createLink(data);
      res.json(link);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/links/:id", authenticateToken, async (req: any, res) => {
    try {
      const { id } = req.params;
      const existingLink = await storage.getLink(id);
      
      if (!existingLink || existingLink.userId !== req.user.id) {
        return res.status(404).json({ message: "Link not found" });
      }

      const updatedLink = await storage.updateLink(id, req.body);
      res.json(updatedLink);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/links/:id", authenticateToken, async (req: any, res) => {
    try {
      const { id } = req.params;
      const existingLink = await storage.getLink(id);
      
      if (!existingLink || existingLink.userId !== req.user.id) {
        return res.status(404).json({ message: "Link not found" });
      }

      await storage.deleteLink(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Link click tracking
  app.post("/api/links/:id/click", async (req, res) => {
    try {
      const { id } = req.params;
      const link = await storage.getLink(id);
      
      if (!link) {
        return res.status(404).json({ message: "Link not found" });
      }

      // Update click count
      await storage.updateLink(id, { clicks: (link.clicks || 0) + 1 });
      
      // Track analytics
      await storage.createAnalytic({
        userId: link.userId,
        linkId: id,
        type: 'click',
      });

      res.json({ url: link.url });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Analytics routes
  app.get("/api/analytics", authenticateToken, async (req: any, res) => {
    try {
      const analytics = await storage.getUserAnalytics(req.user.id);
      const links = await storage.getUserLinks(req.user.id);
      
      const totalClicks = analytics.filter(a => a.type === 'click').length;
      const pageViews = analytics.filter(a => a.type === 'view').length;
      
      // Get this month's data
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthlyClicks = analytics.filter(a => 
        a.type === 'click' && a.timestamp >= startOfMonth
      ).length;

      res.json({
        totalClicks,
        pageViews,
        monthlyClicks,
        linkStats: links.map(link => ({
          id: link.id,
          title: link.title,
          clicks: link.clicks || 0,
        })),
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
