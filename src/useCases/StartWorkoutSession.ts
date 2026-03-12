import {
  ConflictError,
  NotFoundError,
  WorkoutPlanNotActiveError,
} from "../errors/index.js";
import { prisma } from "../lib/db.js";

interface InputDTO {
  userId: string;
  workoutPlanId: string;
  workoutDayId: string;
}

interface OutputDTO {
  workoutSessionId: string;
}

export class StartWorkoutSession {
  async execute(dto: InputDTO): Promise<OutputDTO> {
    const workoutPlan = await prisma.workoutPlan.findUnique({
      where: { id: dto.workoutPlanId },
    });

    if (!workoutPlan || workoutPlan.userId !== dto.userId) {
      throw new NotFoundError("Workout plan not found");
    }

    if (!workoutPlan.isActive) {
      throw new WorkoutPlanNotActiveError("Workout plan is not active");
    }

    const workoutDay = await prisma.workoutDay.findUnique({
      where: { id: dto.workoutDayId },
      include: { sessions: true },
    });

    if (!workoutDay || workoutDay.workoutPlanId !== dto.workoutPlanId) {
      throw new NotFoundError("Workout day not found");
    }

    const hasActiveSession = workoutDay.sessions.some((s) => s.startedAt);

    if (hasActiveSession) {
      throw new ConflictError(
        "Workout day already has an ongoing session",
      );
    }

    const session = await prisma.workoutSession.create({
      data: {
        workoutDayId: dto.workoutDayId,
        startedAt: new Date(),
      },
    });

    return { workoutSessionId: session.id };
  }
}
