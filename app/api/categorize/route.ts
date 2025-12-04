import { NextRequest, NextResponse } from 'next/server';
import { categorizeExpenseCore, CategorizeResponse } from '@/lib/categorize';

export const runtime = 'edge';

export async function POST(request: NextRequest): Promise<NextResponse<CategorizeResponse>> {
    try {
        const body = await request.json();
        const { name } = body;

        if (!name || typeof name !== 'string') {
            return NextResponse.json(
                { error: 'Expense name is required' },
                { status: 400 }
            );
        }

        const googleAiApiKey = process.env.GOOGLE_AI_API_KEY;
        const pixabayApiKey = process.env.PIXABAY_API_KEY;

        if (!googleAiApiKey) {
            return NextResponse.json(
                { error: 'Google AI API key not configured' },
                { status: 500 }
            );
        }

        const result = await categorizeExpenseCore(name, {
            googleAiApiKey,
            pixabayApiKey,
        });

        if ('error' in result) {
            return NextResponse.json(result, { status: 400 });
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('Categorize API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
