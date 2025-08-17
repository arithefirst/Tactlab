CREATE TABLE "scores" (
	"owner" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"score" integer NOT NULL
);
