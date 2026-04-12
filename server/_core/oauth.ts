import type { Express } from "express";
import bcrypt from "bcryptjs";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { sdk } from "./sdk";
import { getSessionCookieOptions } from "./cookies";
import * as db from "../db";

/**
 * Register local authentication routes (login + register)
 * Replaces the previous Manus OAuth callback
 */
export function registerOAuthRoutes(app: Express) {
  // POST /api/auth/login - Local email/password login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email e senha são obrigatórios" });
      }

      const user = await db.getUserByEmail(email.toLowerCase().trim());
      if (!user) {
        return res.status(401).json({ error: "Email ou senha incorretos" });
      }

      if (!user.ativo) {
        return res.status(403).json({ error: "Conta desativada. Contate o administrador." });
      }

      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ error: "Email ou senha incorretos" });
      }

      // Create session token
      const token = await sdk.createSessionToken(user.id, {
        email: user.email,
        name: user.name || "",
      });

      // Set cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, token, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      await db.updateLastSignedIn(user.id);

      return res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("[Auth] Login error:", error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // POST /api/auth/register - Create new account
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, name } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({ error: "Nome, email e senha são obrigatórios" });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: "A senha deve ter pelo menos 6 caracteres" });
      }

      const normalizedEmail = email.toLowerCase().trim();

      // Check if user already exists
      const existing = await db.getUserByEmail(normalizedEmail);
      if (existing) {
        return res.status(409).json({ error: "Este email já está cadastrado" });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);

      // Create user
      const user = await db.createUser({
        email: normalizedEmail,
        passwordHash,
        name: name.trim(),
      });

      if (!user) {
        return res.status(500).json({ error: "Erro ao criar conta" });
      }

      // Create session token and auto-login
      const token = await sdk.createSessionToken(user.id, {
        email: user.email,
        name: user.name || "",
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, token, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      return res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("[Auth] Register error:", error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
}
