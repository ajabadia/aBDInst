'use server';

export async function generateSpecSheet(id: string) {
    console.log("Generating PDF for", id);
    return { success: false, error: "PDF Generation not implemented yet." };
}
