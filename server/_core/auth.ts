import type { Express } from "express";
import bcrypt from "bcryptjs";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { sdk } from "./sdk";
import { getSessionCookieOptions } from "./cookies";
import * as db from "../db";

/**
 * Register local authentication routes (login + register-org)
 */
export function registerAuthRoutes(app: Express) {
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
          organizationId: user.organizationId,
        },
      });
    } catch (error) {
      console.error("[Auth] Login error:", error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // POST /api/auth/register-org - Create new organization + admin user
  app.post("/api/auth/register-org", async (req, res) => {
    try {
      const { orgName, name, email, password } = req.body;

      if (!orgName || !name || !email || !password) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios" });
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

      // Generate slug from org name
      const slug = orgName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      // Check if slug already exists
      const existingOrg = await db.getOrganizationBySlug(slug);
      if (existingOrg) {
        return res.status(409).json({ error: "Já existe uma organização com este nome" });
      }

      // 1. Create organization
      const org = await db.createOrganization({
        nome: orgName.trim(),
        slug,
        email: normalizedEmail,
        plano: "trial",
        maxUsuarios: 5,
      });

      // 2. Create admin user
      const passwordHash = await bcrypt.hash(password, 12);
      const user = await db.createUser({
        organizationId: org.id,
        email: normalizedEmail,
        passwordHash,
        name: name.trim(),
        role: "admin",
        isOrgAdmin: true,
      });

      if (!user) {
        return res.status(500).json({ error: "Erro ao criar conta" });
      }

      // 3. Seed default pipeline stages
      await db.seedDefaultStages(org.id);

      // 4. Auto-login
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
          organizationId: org.id,
        },
        organization: {
          id: org.id,
          nome: org.nome,
          slug: org.slug,
          plano: org.plano,
        },
      });
    } catch (error) {
      console.error("[Auth] Register-org error:", error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
}
