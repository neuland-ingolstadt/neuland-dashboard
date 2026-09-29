import {
	type _Object,
	DeleteObjectCommand,
	type DeleteObjectCommandInput,
	ListObjectsV2Command,
	type ListObjectsV2CommandInput,
	PutObjectCommand,
	type PutObjectCommandInput,
	S3Client,
} from "@aws-sdk/client-s3";
import { serverConfig } from "#/lib/config";

let s3Client: S3Client | null = null;

function requireS3Config() {
	const { bucket, accessKeyId, secretAccessKey, region, endpoint } =
		serverConfig.s3;

	if (!bucket || !accessKeyId || !secretAccessKey) {
		throw new Error(
			"Missing required S3 environment variables: S3_BUCKET_NAME, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY",
		);
	}

	return {
		bucket,
		accessKeyId,
		secretAccessKey,
		region,
		endpoint,
	};
}

function getS3Client(): S3Client {
	if (s3Client) return s3Client;

	const config = requireS3Config();
	s3Client = new S3Client({
		region: config.region,
		endpoint: config.endpoint,
		credentials: {
			accessKeyId: config.accessKeyId,
			secretAccessKey: config.secretAccessKey,
		},
		forcePathStyle: true,
	});

	return s3Client;
}

export function getS3BucketName(): string {
	return requireS3Config().bucket;
}

export function getS3Endpoint(): string {
	return requireS3Config().endpoint;
}

export async function uploadToS3(
	key: string,
	buffer: Buffer,
	contentType: string,
	metadata?: Record<string, string>,
): Promise<string> {
	const { bucket, endpoint } = requireS3Config();
	const client = getS3Client();

	const uploadParams: PutObjectCommandInput = {
		Bucket: bucket,
		Key: key,
		Body: buffer,
		ContentType: contentType,
		ACL: "public-read",
		Metadata: metadata,
	};

	try {
		const command = new PutObjectCommand(uploadParams);
		await client.send(command);
		return `${endpoint}/${bucket}/${key}`;
	} catch (error) {
		console.error("Error uploading to S3:", error);
		throw new Error(
			`Failed to upload file to S3: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
	}
}

export async function listS3Objects(
	prefix?: string,
	maxKeys = 1000,
): Promise<_Object[]> {
	const { bucket } = requireS3Config();
	const client = getS3Client();

	const listParams: ListObjectsV2CommandInput = {
		Bucket: bucket,
		Prefix: prefix,
		MaxKeys: maxKeys,
	};

	try {
		const command = new ListObjectsV2Command(listParams);
		const response = await client.send(command);
		return response.Contents || [];
	} catch (error) {
		console.error("Error listing S3 objects:", error);
		throw new Error(
			`Failed to list S3 objects: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
	}
}

export async function deleteFromS3(key: string): Promise<void> {
	const { bucket } = requireS3Config();
	const client = getS3Client();

	const deleteParams: DeleteObjectCommandInput = {
		Bucket: bucket,
		Key: key,
	};

	try {
		const command = new DeleteObjectCommand(deleteParams);
		await client.send(command);
	} catch (error) {
		console.error("Error deleting from S3:", error);
		throw new Error(
			`Failed to delete file from S3: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
	}
}

export function generateS3Key(fileId: string): string {
	return `uploads/announcements/${fileId}.webp`;
}

export function extractFilenameFromKey(key: string): string {
	return key.split("/").pop() || key;
}

export function getS3PublicUrl(key: string): string {
	const { bucket, endpoint } = requireS3Config();
	return `${endpoint}/${bucket}/${key}`;
}
