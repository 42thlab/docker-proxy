'use strict';

let _ = require('lodash'),
  moment = require('moment'),
  errors = require('../../app/routes/shared/errors'),
  models = require('../../app/models'),
  concerns = require('./concerns');

const DEFAULT_STRATEGY = 'spread',
      VALID_STRATEGIES = [DEFAULT_STRATEGY, 'binpack', 'random'];

describe('Cluster Model', () => {
  db.sync();

  concerns.behavesAsAStateMachine('cluster');

  describe('validations', () => {
    it('succeeds with valid attributes', () => {
      let cluster = factory.buildSync('cluster');

      return expect(cluster.save()).to.be.fulfilled;
    });

    it('succeeds with a min size name', () => {
      let cluster = factory.buildSync('cluster', { name: _.repeat('*', 1) });

      return expect(cluster.save()).to.be.fulfilled;
    });

    it('succeeds with a max size name', () => {
      let cluster = factory.buildSync('cluster', { name: _.repeat('*', 64) });

      return expect(cluster.save()).to.be.fulfilled;
    });

    VALID_STRATEGIES.forEach(strategy => {
      it(`succeeds with a ${strategy} strategy`, () => {
        let cluster = factory.buildSync('cluster', { strategy: strategy });

        return expect(cluster.save()).to.be.fulfilled;
      });
    });

    it('fails without a name', () => {
      let cluster = factory.buildSync('cluster', { name: null });

      return expect(cluster.save()).to.be.rejected;
    });

    it('fails with an empty name', () => {
      let cluster = factory.buildSync('cluster', { name: '' });

      return expect(cluster.save()).to.be.rejected;
    });

    it('fails with a too long name', () => {
      let cluster = factory.buildSync('cluster', { name: _.repeat('*', 65) });

      return expect(cluster.save()).to.be.rejected;
    });

    it('fails with an empty strategy', () => {
      let cluster = factory.buildSync('cluster', { strategy: null });

      return expect(cluster.save()).to.be.rejected;
    });

    it('fails with an invalid strategy', () => {
      let cluster = factory.buildSync('cluster', { strategy: 'whatever' });

      return expect(cluster.save()).to.be.rejected;
    });
  });

  it('has a default strategy', () => {
    let cluster = factory.buildSync('cluster');

    return expect(cluster.save())
      .to.eventually.have.property('strategy', DEFAULT_STRATEGY);
  });

  context('#upgrade', () => {
    context('when cluster is not running', () => {
      let cluster;

      beforeEach(() => {
        cluster = factory.buildSync('cluster');
        return cluster.save();
      });

      it('returns an error', () => {
        let expected = new errors.StateError('upgrade', cluster.state);

        return cluster.upgrade().catch(err => {
          expect(err).to.deep.equal(expected);
        });
      });
    });

    context('when cluster is running', () => {
      let cluster;

      beforeEach(() => {
        cluster = factory.buildSync('runningCluster');
        return cluster.save();
      });

      context.skip('when cluster already has the latest versions', () => {

      });

      context('when nodes upgrade succeeds', () => {
        let fakeNodes;

        beforeEach(done => {
          fakeNodes = _.repeat({
            upgrade: sinon.stub().returns(true)
          }, 10);
          cluster.getNodes = sinon.stub().returns(Promise.resolve(fakeNodes));
        });

        ['docker', 'swarm'].forEach(binary => {
          it.skip(`has the latest ${binary} version available`, () => {

          });
        });

        it('is in upgrading state', () => {
          return expect(cluster.upgrade().then(() => {
            return cluster.reload();
          })).to.eventually.have.property('state', 'upgrading');
        });

        it.skip('upgrades all the cluster nodes', () => {
          return cluster.upgrade().then(() => {
            fakeNodes.forEach(node => {
              expect(node.upgrade).to.have.been.called;
            });
          });
        });

        it('returns the upgraded cluster', () =>{
          return expect(cluster.upgrade())
            .to.eventually.deep.equal(cluster);
        });
      });

      // Add a tests verifying that we receive a promise chain
      // equal to all nodes.upgrade + cluster.update

      context.skip('when a node upgrade fails', () => {
        let fakeNodes;

        beforeEach(done => {
          fakeNodes = _.repeat({
            upgrade: sinon.stub().returns(false)
          }, 10);
          cluster.getNodes = sinon.stub().returns(Promise.resolve(fakeNodes));
        });

        it('cancels all nodes upgrade', () => {
          return cluster.upgrade().catch(() => {
            fakeNodes.forEach(node => {
              expect(node.upgrade).not.to.have.been.called;
            });
          });
        });

        it('is not in upgrading state', () => {
          return cluster.upgrade().catch(() => {
            return expect(cluster.reload())
              .not.to.eventually.have.property('state', 'upgrading')
          });
        });

        ['docker', 'swarm'].forEach(binary => {
          it.skip(`has the same ${binary} version as before`, () => {
          });
        });
      });
    });
  });

  context.skip('#notify', () => {

  });

  context('afterDestroy', () => {
    let cluster, nodesId;

    beforeEach(done => {
      factory.create('cluster', (err, clusterCreated) => {
        cluster = clusterCreated;
        factory.createMany('node', { cluster_id: cluster.id }, 10,
          (err, nodes) => {
            nodesId = _.pluck(nodes, 'id');
            done(err);
        });
      });
    });

    it('removes its nodes', () => {
      return expect(
        cluster.destroy().then(() => {
          return models.Node.findAll({ where: { id: nodesId } });
        })
      ).to.be.fulfilled.and.to.eventually.be.empty;
    });
  });

  context('afterCreate', () => {
    let cluster;

    beforeEach(() => {
      cluster = factory.buildSync('cluster');
      return cluster.save();
    });

    it('has a token', () => {
      expect(cluster.token).to.exist;
    });

    it('can be deleted', () => {
      return expect(cluster.destroy().then(() => {
        return models.Cluster.findById(cluster.id);
      })).to.be.fulfilled.and.to.eventually.be.empty;
    });

    context('adding a node to this cluster', () => {
      let previousNodesCount;

      beforeEach(() => {
        previousNodesCount = cluster.nodes_count;

        return models.Node.create({ cluster_id: cluster.id, name: 'test' })
        .then(() => {
          return cluster.reload();
        });
      });

      it('increases the node counter cache', () => {
        expect(cluster.nodes_count).to.equal(previousNodesCount + 1);
      });
    });
  });
});
