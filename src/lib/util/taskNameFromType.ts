import { Activity, Tasks } from '../constants';

export function taskNameFromType(activityType: Activity) {
	switch (activityType) {
		case Activity.ClueCompletion:
			return Tasks.ClueActivity;
		case Activity.MonsterKilling:
			return Tasks.MonsterActivity;
		case Activity.Mining:
			return Tasks.MiningActivity;
		case Activity.Smithing:
			return Tasks.SmithingActivity;
		case Activity.Questing:
			return Tasks.QuestingActivity;
	}
}
