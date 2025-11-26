import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    {
      id: 'steam',
      name: 'Steam',
      type: 'oauth',
      authorization: {
        url: 'https://steamcommunity.com/openid/login',
        params: {
          'openid.ns': 'http://specs.openid.net/auth/2.0',
          'openid.mode': 'checkid_setup',
          'openid.return_to': `${process.env.NEXTAUTH_URL}/api/auth/callback/steam`,
          'openid.realm': process.env.NEXTAUTH_URL,
          'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
          'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
        },
      },
      token: {
        async request(context: any) {
          // Extract the query parameters from the callback
          const params = context.params as any

          // Build the validation params
          const validationParams: Record<string, string> = {
            'openid.assoc_handle': params['openid.assoc_handle'] || '',
            'openid.signed': params['openid.signed'] || '',
            'openid.sig': params['openid.sig'] || '',
            'openid.ns': 'http://specs.openid.net/auth/2.0',
            'openid.mode': 'check_authentication',
          }

          // Add all signed fields
          const signedFields = params['openid.signed']?.split(',') || []
          for (const field of signedFields) {
            validationParams[`openid.${field}`] = params[`openid.${field}`] || ''
          }

          // Validate with Steam
          const validationUrl = new URL('https://steamcommunity.com/openid/login')
          const urlParams = new URLSearchParams(validationParams)

          const response = await fetch(validationUrl, {
            method: 'POST',
            headers: {
              'Accept-language': 'en',
              'Content-type': 'application/x-www-form-urlencoded',
              'Content-Length': urlParams.toString().length.toString(),
            },
            body: urlParams.toString(),
          })

          const result = await response.text()

          if (result.match(/is_valid\s*:\s*true/i)) {
            // Extract Steam ID from claimed_id
            const matches = params['openid.claimed_id']?.match(
              /^https:\/\/steamcommunity\.com\/openid\/id\/([0-9]{17,25})/
            )
            const steamId = matches?.[1] || '0'

            return {
              tokens: {
                access_token: steamId,
                steamId: steamId,
              } as any,
            }
          }

          throw new Error('Steam authentication failed')
        },
      },
      userinfo: {
        async request(context: any) {
          const steamId = (context.tokens as any).steamId

          if (!process.env.STEAM_API_KEY) {
            throw new Error('STEAM_API_KEY not configured')
          }

          const response = await fetch(
            `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAM_API_KEY}&steamids=${steamId}`
          )

          const data = await response.json()
          return data.response.players[0]
        },
      },
      profile(profile: any) {
        return {
          id: profile.steamid,
          name: profile.personaname,
          email: null,
          image: profile.avatarfull,
        }
      },
      idToken: false,
      checks: ['none'],
      clientId: 'steam',
      clientSecret: process.env.STEAM_API_KEY!,
    } as any,
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { steamId: true },
        })
        session.user.steamId = dbUser?.steamId || null
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // Store Steam ID in the user record
      if (account?.provider === 'steam' && profile) {
        const steamId = (profile as any).steamid
        await prisma.user.update({
          where: { id: user.id },
          data: { steamId },
        })
      }
      return true
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
