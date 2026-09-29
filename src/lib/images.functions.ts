import { randomUUID } from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import sharp from "sharp";
import { requireAccessToken, requireCapability } from "#/lib/auth.server";
import {
	extractFilenameFromKey,
	generateS3Key,
	getS3PublicUrl,
	listS3Objects,
	uploadToS3,
} from "#/lib/s3.server";

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
	"image/jpeg",
	"image/png",
	"image/gif",
	"image/webp",
	"image/tiff",
	"image/bmp",
	"image/svg+xml",
	"image/avif",
	"image/heic",
	"image/heif",
]);

export type ListedImage = {
	name: string;
	url: string;
	size?: number;
	uploadedAt?: string;
};

export const listImagesFn = createServerFn({ method: "GET" }).handler(
	async (): Promise<ListedImage[]> => {
		await requireCapability("announcements");
		const s3Objects = await listS3Objects("uploads/");
		const images: ListedImage[] = [];

		for (const obj of s3Objects) {
			if (!obj.Key) continue;
			const isImage = /\.(jpeg|jpg|png|gif|webp)$/i.test(obj.Key);
			if (!isImage) continue;

			images.push({
				name: extractFilenameFromKey(obj.Key),
				url: getS3PublicUrl(obj.Key),
				size: obj.Size,
				uploadedAt: obj.LastModified?.toISOString(),
			});
		}

		images.sort((a, b) => {
			if (!a.uploadedAt && !b.uploadedAt) return 0;
			if (!a.uploadedAt) return 1;
			if (!b.uploadedAt) return -1;
			return (
				new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
			);
		});

		return images;
	},
);

export const uploadImageFn = createServerFn({ method: "POST" })
	.validator((data: FormData) => {
		if (!(data instanceof FormData)) {
			throw new Error("Expected FormData");
		}
		return data;
	})
	.handler(async ({ data }) => {
		const { user } = await requireAccessToken();
		await requireCapability("announcements", { asJson: true });

		const file = data.get("image");
		if (!(file instanceof File)) {
			throw new Error("No file uploaded");
		}

		if (file.size > MAX_FILE_SIZE_BYTES) {
			throw new Error(`File size exceeds the limit of ${MAX_FILE_SIZE_MB}MB`);
		}

		if (!file.type || !ALLOWED_MIME_TYPES.has(file.type)) {
			throw new Error(
				"Invalid file type. Only common image formats are allowed.",
			);
		}

		const fileId = randomUUID();
		const originalFilename = file.name || `upload-${fileId}`;
		const s3Key = generateS3Key(fileId);
		const inputBuffer = Buffer.from(await file.arrayBuffer());
		const webpBuffer = await sharp(inputBuffer)
			.webp({ quality: 80 })
			.toBuffer();

		const imageUrl = await uploadToS3(s3Key, webpBuffer, "image/webp", {
			originalFilename,
			uploadedBy: user.email || "unknown",
			uploadedAt: new Date().toISOString(),
		});

		return {
			id: fileId,
			imageUrl,
			filename: originalFilename,
			size: webpBuffer.length,
		};
	});
