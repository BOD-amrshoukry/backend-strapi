import jwt from 'jsonwebtoken';

export function generateTokens(member) {
  const accessToken = jwt.sign(
    {
      id: member.id,
      role: member.role,
      tokenVersion: member.tokenVersion,
      documentId: member.documentId,
    },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }, // short-lived
  );

  const refreshToken = jwt.sign(
    {
      id: member.id,
      tokenVersion: member.tokenVersion,
      documentId: member.documentId,
    },
    process.env.REFRESH_SECRET,
    { expiresIn: '7d' }, // long-lived
  );

  return { accessToken, refreshToken };
}

