import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import { SettingsModel } from "@/models/data_models/settings_model";
import ApiErrorModel from "@/models/app_models/api_error_model";

/**
 * Updates system settings
 * @param NextApiRequest request 
 * @param NextApiResponse<SettingsModel | ApiErrorModel> response
 * @returns SettingsModel | ApiErrorModel
 */
export default async function PUT(
    request: NextApiRequest,
    response: NextApiResponse<SettingsModel | ApiErrorModel>,
) {
    try {
        const setting_id: string = request.query.setting as string;
        const data = request.body;
        const result = await prisma.settings.update({
            where: { id: setting_id },
            data,
        });
        return response.status(200).json(result as SettingsModel);
    } catch (error) {
        console.error("Error handling settings API request:", error);
        return response.status(500).json({
            error: "An unexpected error occurred while processing the request.",
        });
    }
}
