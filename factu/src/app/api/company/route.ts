import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Company } from '@/types';

export async function GET() {
  try {
    const db = await getDatabase();
    const company = await db.collection<Company>('company').findOne({});
    return NextResponse.json(company);
  } catch {
    return NextResponse.json({ error: 'Error fetching company' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDatabase();
    const body = await request.json();

    // Check if company already exists
    const existing = await db.collection<Company>('company').findOne({});
    if (existing) {
      return NextResponse.json({ error: 'Company already exists' }, { status: 400 });
    }

    const result = await db.collection<Company>('company').insertOne(body);
    return NextResponse.json({ _id: result.insertedId, ...body });
  } catch {
    return NextResponse.json({ error: 'Error creating company' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const db = await getDatabase();
    const body = await request.json();

    const existing = await db.collection<Company>('company').findOne({});
    if (!existing) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    await db.collection<Company>('company').updateOne(
      { _id: existing._id },
      { $set: body }
    );

    return NextResponse.json({ _id: existing._id, ...body });
  } catch {
    return NextResponse.json({ error: 'Error updating company' }, { status: 500 });
  }
}
