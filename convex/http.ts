import { httpRouter } from 'convex/server';

import { internal } from './_generated/api';
import { httpAction } from './_generated/server';

const http = httpRouter();

http.route({
    path: '/clerk',
    method: 'POST',
    handler: httpAction(async (ctx, request) => {
        const payloadString = await request.text();
        const headerPayload = request.headers;

        try {
            const result = await ctx.runAction(internal.clerk.fulfill, {
                payload: payloadString,
                headers: {
                    'svix-id': headerPayload.get('svix-id')!,
                    'svix-timestamp': headerPayload.get('svix-timestamp')!,
                    'svix-signature': headerPayload.get('svix-signature')!,
                },
            });
            console.log(`Received webhook event: ${result.type}`, result);

            switch (result.type) {
                case 'user.created':
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const nipFromClerk = ((result.data as any).public_metadata?.nip as string) || '';
                    if (!nipFromClerk) {
                        console.warn(`User dengan ID ${result.data.id} dibuat tanpa NIP di metadata.`);
                    }

                    await ctx.runMutation(internal.users.createUser, {
                        tokenIdentifier: `${process.env.NEXT_PUBLIC_CLERK_FRONTEND_API_URL}|${result.data.id}`,
                        name: `${result.data.first_name ?? ''} ${result.data.last_name ?? ''}`,
                        image: result.data.image_url,
                        nip: nipFromClerk,
                        role: 'pegawai',
                    });
                    break;
                case 'user.deleted':
                    await ctx.runMutation(internal.users.deleteUser, {
                        tokenIdentifier: `${process.env.NEXT_PUBLIC_CLERK_FRONTEND_API_URL}|${result.data.id}`,
                    });
                    break;
                case 'user.updated':
                    await ctx.runMutation(internal.users.updateUser, {
                        tokenIdentifier: `${process.env.NEXT_PUBLIC_CLERK_FRONTEND_API_URL}|${result.data.id}`,
                        name: `${result.data.first_name ?? ''} ${result.data.last_name ?? ''}`,
                        image: result.data.image_url,
                    });
                    break;
            }

            return new Response(null, {
                status: 200,
            });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            return new Response('Webhook Error', {
                status: 400,
            });
        }
    }),
});

export default http;
