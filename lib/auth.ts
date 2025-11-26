import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'

// Type definitions
interface SteamProfile {
  steamid: string
  personaname: string
  avatarfull: string
  profileurl?: string
  realname?: string
}

interface SteamTokens {
  access_token: string
  steamId: string
}

interface TokenContext {
  params: Record<string, string>
}

interface UserinfoContext {
  tokens: SteamTokens
}

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
        async request(context: TokenContext) {
          // Extract the query parameters from the callback
          const params = context.params

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
              },
            }
          }

          throw new Error('Steam authentication failed')
        },
      },
      userinfo: {
        async request(context: UserinfoContext) {
          const steamId = context.tokens.steamId

          if (!process.env.STEAM_API_KEY) {
            throw new Error('STEAM_API_KEY not configured')
          }

          try {
            const response = await fetch(
              `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAM_API_KEY}&steamids=${steamId}`
            )

            if (!response.ok) {
              throw new Error(`Steam API request failed with status ${response.status}`)
            }

            const data = await response.json()

            if (!data.response?.players?.[0]) {
              throw new Error('No player data returned from Steam API')
            }

            return data.response.players[0] as SteamProfile
          } catch (error) {
            console.error('Steam API error:', error)
            throw new Error('Failed to fetch Steam player data')
          }
        },
      },
      profile(profile: SteamProfile) {
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
    } as any, // Custom provider requires type assertion due to NextAuth's strict provider typing
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
        const steamId = (profile as SteamProfile).steamid
        // Use upsert to handle race condition on first sign-in
        await prisma.user.upsert({
          where: { id: user.id },
          update: { steamId },
          create: {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            steamId,
          },
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
