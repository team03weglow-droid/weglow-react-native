import assert from 'node:assert/strict';
import { test } from 'node:test';

import { CommonActions, StackRouter } from '@react-navigation/routers';

import { rootRouteNames, rootRoutes } from './routes';

const options = {
  routeNames: rootRouteNames,
  routeParamList: { Welcome: undefined, AdultConfirmation: undefined },
  routeGetIdList: {},
};
const router = StackRouter({ initialRouteName: rootRoutes.Welcome });

test('root stack starts at Welcome', () => {
  const state = router.getInitialState(options);
  assert.equal(state.routes[state.index]?.name, rootRoutes.Welcome);
});

test('Welcome can open Adult Confirmation and back removes that visit', () => {
  const initial = router.getInitialState(options);
  const adult = router.getStateForAction(
    initial,
    CommonActions.navigate(rootRoutes.AdultConfirmation),
    options,
  );
  assert.ok(adult && adult.stale === false);
  assert.equal(adult.routes[adult.index]?.name, rootRoutes.AdultConfirmation);
  const back = router.getStateForAction(adult, CommonActions.goBack(), options);
  assert.ok(back && back.stale === false);
  assert.equal(back.routes[back.index]?.name, rootRoutes.Welcome);
  assert.deepEqual(
    back.routes.map((route) => route.name),
    [rootRoutes.Welcome],
  );
  const reentered = router.getStateForAction(
    back,
    CommonActions.navigate(rootRoutes.AdultConfirmation),
    options,
  );
  assert.ok(reentered && reentered.stale === false);
  assert.notEqual(
    reentered.routes[reentered.index]?.key,
    adult.routes[adult.index]?.key,
  );
});

test('the questionnaire has no registered navigation destination', () => {
  const initial = router.getInitialState(options);
  assert.equal(
    router.getStateForAction(
      initial,
      CommonActions.navigate('SkinQuestionnaire'),
      options,
    ),
    null,
  );
});
