import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import 'sinon-as-promised';

import engines from '../src';

chai.use(chaiAsPromised);
chai.use(sinonChai);

const expect = chai.expect;

describe('index', () => {
  describe('#save()', () => {
    it('should call save() on all engines', () => {
      // given
      const state = {
        foo: 1,
        bar: 2
      };

      const engine0 = { save: sinon.stub().resolves() };
      const engine1 = { save: sinon.stub().resolves() };
      const engine = engines([engine0, engine1]);

      // when
      engine.save(state);

      // then
      return Promise.all([
        expect(engine0.save).to.have.been.calledWith(state),
        expect(engine1.save).to.have.been.calledWith(state)
      ]);
    });

    it('should pass error from decorated engine', () => {
      // given
      const saveError = new Error('Upsy');

      const engine0 = { save: sinon.stub().rejects(saveError) };
      const engine1 = { save: sinon.stub().resolves() };

      const engine = engines([engine0, engine1]);

      // expect
      return expect(engine.save()).to.be.rejectedWith(saveError);
    });
  });

  describe('#load()', () => {
    it('should merge state from all engines', () => {
      // given
      const state0 = { foo: 1 };
      const engine0 = { load: sinon.stub().resolves(state0) };

      const state1 = { bar: 2 };
      const engine1 = { load: sinon.stub().resolves(state1) };

      const engine = engines([engine0, engine1]);

      // expect
      return expect(engine.load()).to.become({ foo: 1, bar: 2 });
    });

    it('should handle an engine returning falsy values', () => {
      // given
      const state0 = { foo: 1 };
      const engine0 = { load: sinon.stub().resolves(state0) };

      const state1 = null;
      const engine1 = { load: sinon.stub().resolves(state1) };

      const engine = engines([engine0, engine1]);

      // expect
      return expect(engine.load()).to.become({ foo: 1 });
    });

    it('should pass error from decorated engine', () => {
      // given
      const state0 = { foo: 1 };
      const engine0 = { load: sinon.stub().resolves(state0) };

      const loadError = new Error('Upsy');
      const engine1 = { load: sinon.stub().rejects(loadError) };

      const engine = engines([engine0, engine1]);

      // expect
      return expect(engine.load()).to.be.rejectedWith(loadError);
    });

    describe('duplicated state', () => {
      const state0 = { foo: 1, bar: 2 };
      const engine0 = { load: sinon.stub().resolves(state0) };

      const state1 = { bar: 3, baz: 4 };
      const engine1 = { load: sinon.stub().resolves(state1) };

      const engine = engines([engine0, engine1]);

      let nodeEnv;

      let warn;

      beforeEach(() => {
        nodeEnv = process.env.NODE_ENV;
        warn = sinon.stub(console, 'warn');
      });

      afterEach(() => {
        process.env.NODE_ENV = nodeEnv;
        warn.restore();
      });

      it('should warn in non-production environment', () => {
        // given
        process.env.NODE_ENV = 'test';

        // expect
        return engine.load().then(() => {
          expect(warn).to.have.been.calledWith(
            '[redux-storage-decorator-engines] "bar" state found in more than one storage'
          );
        });
      });

      it('should not warn in production environment', () => {
        // given
        process.env.NODE_ENV = 'production';

        // expect
        return engine.load().then(() => {
          expect(warn).not.to.have.been.called; // eslint-disable-line no-unused-expressions
        });
      });
    });
  });
});
