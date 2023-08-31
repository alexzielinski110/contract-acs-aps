// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  SUCCESS: 'success',
  STATUS_NEW: 'New',
  STATUS_REVIEW: 'Review',
  STATUS_APPROVED: 'Approved',
  STATUS_REJECTED: 'Rejected',
  TASK_OUTCOME_APPROVE: 'Approve',
  TASK_OUTCOME_REJECT: 'Reject',
  TASK_STATE_ACTIVE: 'active',
  TASK_STATE_COMPLETED: 'completed',
  TASK_FILTER_INVOLVED: 'Involved Tasks',
  USER_PREFERENCE_INVOLVED_TASK_FILTERID: 'involved.task.filterId'
};
