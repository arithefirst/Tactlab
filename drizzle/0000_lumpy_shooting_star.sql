CREATE TABLE "videoData" (
	"objectId" text PRIMARY KEY NOT NULL,
	"ogFilename" text,
	"owner" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"tlVideoId" text,
	CONSTRAINT "videoData_objectId_unique" UNIQUE("objectId")
);
