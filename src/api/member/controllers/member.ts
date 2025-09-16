/**
 * member controller
 */

import { factories } from '@strapi/strapi';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { generateTokens } from '../../../utils/token';

export default factories.createCoreController(
  'api::member.member',
  ({ strapi }) => ({
    async login(ctx) {
      const { email, password } = ctx.request.body;

      if (!email || !password) {
        return ctx.badRequest('Email and password are required');
      }

      // Find member by email
      const member = await strapi.db.query('api::member.member').findOne({
        where: { email },
      });

      if (!member) {
        return ctx.unauthorized('Invalidd email or password');
      }

      console.log(member);
      console.log(member.password);
      console.log(password);

      const test = await bcrypt.hash('123456', 10);
      console.log(await bcrypt.compare('123456', test)); // should be true

      // Compare password
      const validPassword = await bcrypt.compare(password, member.password);
      if (!validPassword) {
        return ctx.unauthorized('Invalidz email or password');
      }

      const tokens = generateTokens(member);

      await strapi.db.query('api::member.member').update({
        where: { id: member.id },
        data: { refreshToken: tokens.refreshToken },
      });

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        member: member,
      };
    },
    async refresh(ctx) {
      const { refreshToken } = ctx.request.body;
      if (!refreshToken) return ctx.throw(400, 'Missing refresh token');

      try {
        const payload = jwt.verify(
          refreshToken,
          process.env.REFRESH_SECRET,
        ) as any;

        const member = await strapi.db.query('api::member.member').findOne({
          where: { id: payload.id },
        });

        if (
          !member ||
          member.refreshToken !== refreshToken ||
          member.tokenVersion !== payload.tokenVersion
        ) {
          return ctx.throw(401, 'Invalid refresh token');
        }

        const tokens = generateTokens(member);

        await strapi.db.query('api::member.member').update({
          where: { id: member.id },
          data: { refreshToken: tokens.refreshToken },
        });

        ctx.body = tokens;
      } catch (err) {
        ctx.throw(401, 'Unauthorized');
      }
    },
  }),
);

