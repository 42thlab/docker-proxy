'use strict';

let errors = require('../../app/routes/shared/errors'),
  pagination = require('../../app/middlewares').pagination;

const DEFAULT_LIMIT  = 25,
      DEFAULT_OFFSET = 0

describe('Pagination Middleware', () => {
  it('parses the pagination parameters from the query string', done => {
    let req = { query: { limit: 10, offset: 12 } };

    pagination(req, {}, () => {
      expect(req.pagination).to.deep.equal({
        limit: req.query.limit,
        offset: req.query.offset,
        group: ['id']
      });
      done();
    });
  });

  context('when limit is not specified', () => {
    let req = { query: { offset: 12 } };

    it('has a default limit', done => {
      pagination(req, {}, () => {
        expect(req.pagination).to.deep.equal({
          limit: 25,
          offset: req.query.offset,
          group: ['id']
        });
        done();
      });
    })
  });

  context('when offset is not specified', () => {
    let req = { query: { limit: 12 } };

    it('has a default offset', done => {
      pagination(req, {}, () => {
        expect(req.pagination).to.deep.equal({
          limit: req.query.limit,
          offset: 0,
          group: ['id']
        });
        done();
      });
    })
  });

  ['limit', 'offset'].forEach(key => {
    [-1, -6, -25].forEach(value => {
      context(`whith a ${key} of ${value}`, () => {
        let req = { query: {} };

        req.query[key] = value;

        it('throws a pagination error', () => {
          expect(() => {
            pagination(req, {})
          }).to.throw(Error)
            .that.deep.equals(new errors.PaginationError(key, value));
        });
      });
    });
  });

  describe('Extends the response object with:', () => {
    let req = { query: { limit: 10, offset: 12 } },
        res = {};

    beforeEach(done => {
      res.json = sinon.stub();
      pagination(req, res, done);
    });

    describe('#paginate()', () => {
      it('returns a function to send the paginated models', () => {
        let send = res.paginate('nodes'),
          result = {
            rows:  ['a', 'b', 'c'],
            count: [{ count: 1 }, { count: 1 }, { count: 1 }, { count: 1 }]
          };
        send(result);
        expect(res.json).to.have.been.calledWith({
          meta: {
            limit: req.query.limit,
            offset: req.query.offset,
            total_count: result.count.length
          },
          nodes: result.rows
        });
      });
    });
  });
});
