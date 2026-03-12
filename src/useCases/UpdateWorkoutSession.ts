import { NotFoundError } from "../errors/index.js";
import { prisma } from "../lib/db.js";

interface InputDTO {
  userId: string;
  workoutPlanId: string;
  workoutDayId: string;
  sessionId: string;
  completedAt: string;
}

interface OutputDTO {
  id: string;
  startedAt: string;
  completedAt: string;
}

export class UpdateWorkoutSession {
  async execute(dto: InputDTO): Promise<OutputDTO> {
    const workoutPlan = await prisma.workoutPlan.findUnique({
      where: { id: dto.workoutPlanId },
    });

    if (!workoutPlan || workoutPlan.userId !== dto.userId) {
      throw new NotFoundError("Workout plan not found");
    }

    const workoutDay = await prisma.workoutDay.findUnique({
      where: { id: dto.workoutDayId },
    });

    if (!workoutDay || workoutDay.workoutPlanId !== dto.workoutPlanId) {
      throw new NotFoundError("Workout day not found");
    }

    const session = await prisma.workoutSession.findUnique({
      where: { id: dto.sessionId },
    });

    if (!session || session.workoutDayId !== dto.workoutDayId) {
      throw new NotFoundError("Workout session not found");
    }

    const updated = await prisma.workoutSession.update({
      where: { id: dto.sessionId },
      data: { completedAt: new Date(dto.completedAt) },
    });

    return {
      id: updated.id,
      startedAt: updated.startedAt.toISOString(),
      completedAt: updated.completedAt!.toISOString(),
    };
  }
}
