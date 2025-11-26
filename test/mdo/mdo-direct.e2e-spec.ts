import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { TestSetup, TestTokens } from '../test-setup';

describe('🗂️ MDO (Mapa Diário Obra) E2E Tests', () => {
  let app: INestApplication;
  let testSetup: TestSetup;
  let tokens: TestTokens;
  let adminToken: string;
  let userToken: string;
  let userId: number;
  let createdHeaderBostamp: string;
  let createdDetailBistamp: string;
  let yesterdayHeaderBostamp: string;

  beforeAll(async () => {
    testSetup = new TestSetup();
    app = await testSetup.setupApp();
    tokens = await testSetup.setupTestData();
    
    adminToken = tokens.adminToken;
    userToken = tokens.userToken;
    userId = tokens.userId;

    // Create a header from yesterday for import testing
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const yesterdayHeaderRes = await request(app.getHttpServer())
      .post('/mdo/headers')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        data: yesterday.toISOString().split('T')[0],
        obra: 'TEST-OBRA-YESTERDAY',
        encarregado: 'Test Encarregado Yesterday'
      });

    if (yesterdayHeaderRes.status === 201) {
      yesterdayHeaderBostamp = yesterdayHeaderRes.body.bostamp;
      
      // Add a detail to yesterday's header
      await request(app.getHttpServer())
        .post('/mdo/details')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          bostamp: yesterdayHeaderBostamp,
          empresa: 'TEST-COMPANY',
          nfunc: '1234567',
          qtt: 8
        });
    }
  }, 30000); // 30 second timeout for beforeAll

  afterAll(async () => {
    await testSetup.teardown();
  });

  describe('A) Headers Controller Tests', () => {
    describe('POST /mdo/headers - Create Header', () => {
      it('✅ should create header with valid data', async () => {
        const today = new Date().toISOString().split('T')[0];
        const res = await request(app.getHttpServer())
          .post('/mdo/headers')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            data: today,
            obra: 'TEST-OBRA-001',
            encarregado: 'Test Encarregado'
          });

        expect(res.status).toBe(201);
        expect(res.body.bostamp).toBeDefined();
        expect(res.body.data).toBe(today);
        expect(res.body.obra).toBe('TEST-OBRA-001');
        expect(res.body.encarregado).toBe('Test Encarregado');
        expect(res.body.userid).toBe(userId);
        expect(res.body.companyName).toBeDefined();
        expect(res.body.employeeNumber).toBeDefined();

        createdHeaderBostamp = res.body.bostamp;
      });

      it('❌ should fail with invalid obra (non-existent)', async () => {
        const today = new Date().toISOString().split('T')[0];
        const res = await request(app.getHttpServer())
          .post('/mdo/headers')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            data: today,
            obra: 'INVALID-OBRA-999',
            encarregado: 'Test Encarregado'
          });

        expect([400, 404]).toContain(res.status);
      });

      it('❌ should fail with missing required fields', async () => {
        const res = await request(app.getHttpServer())
          .post('/mdo/headers')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            data: new Date().toISOString().split('T')[0]
            // Missing obra and encarregado
          });

        expect(res.status).toBe(400);
      });
    });

    describe('GET /mdo/headers - List Headers with Pagination', () => {
      it('✅ should return paginated headers', async () => {
        const res = await request(app.getHttpServer())
          .get('/mdo/headers?page=1')
          .set('Authorization', `Bearer ${userToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('page');
        expect(res.body).toHaveProperty('total');
        expect(res.body).toHaveProperty('totalPages');
        expect(res.body).toHaveProperty('items');
        expect(Array.isArray(res.body.items)).toBe(true);
      });

      it('✅ should respect pagination parameters', async () => {
        const res = await request(app.getHttpServer())
          .get('/mdo/headers?page=1&limit=5')
          .set('Authorization', `Bearer ${userToken}`);

        expect(res.status).toBe(200);
        expect(res.body.items.length).toBeLessThanOrEqual(5);
      });
    });

    describe('Access Control Tests', () => {
      it('✅ user should access their own header', async () => {
        const res = await request(app.getHttpServer())
          .get(`/mdo/headers/${createdHeaderBostamp}`)
          .set('Authorization', `Bearer ${userToken}`);

        expect(res.status).toBe(200);
        expect(res.body.bostamp).toBe(createdHeaderBostamp);
      });

      it('✅ supervisor should access any header', async () => {
        const res = await request(app.getHttpServer())
          .get(`/mdo/headers/${createdHeaderBostamp}`)
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.bostamp).toBe(createdHeaderBostamp);
      });
    });

    describe('GET /mdo/headers/:bostamp/full - Full Sheet Retrieval', () => {
      it('✅ should return header with details', async () => {
        // First add a detail to the header
        await request(app.getHttpServer())
          .post('/mdo/details')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            bostamp: createdHeaderBostamp,
            empresa: 'TEST-COMPANY',
            nfunc: '1234567',
            qtt: 8
          });

        const res = await request(app.getHttpServer())
          .get(`/mdo/headers/${createdHeaderBostamp}/full`)
          .set('Authorization', `Bearer ${userToken}`);

        expect(res.status).toBe(200);
        expect(res.body.header).toBeDefined();
        expect(res.body.details).toBeDefined();
        expect(Array.isArray(res.body.details)).toBe(true);
        expect(res.body.header.bostamp).toBe(createdHeaderBostamp);
      });
    });

    describe('PUT /mdo/headers/:bostamp - Update Header', () => {
      it('✅ should update header on same day', async () => {
        const res = await request(app.getHttpServer())
          .put(`/mdo/headers/${createdHeaderBostamp}`)
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            obra: 'UPDATED-OBRA-001',
            encarregado: 'Updated Encarregado'
          });

        expect(res.status).toBe(200);
        expect(res.body.obra).toBe('UPDATED-OBRA-001');
        expect(res.body.encarregado).toBe('Updated Encarregado');
      });

      it('❌ should fail to update header from previous day (creation-day lock)', async () => {
        if (yesterdayHeaderBostamp) {
          const res = await request(app.getHttpServer())
            .put(`/mdo/headers/${yesterdayHeaderBostamp}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({
              obra: 'SHOULD-NOT-UPDATE',
              encarregado: 'Should Not Update'
            });

          expect([403, 400]).toContain(res.status);
        }
      });

      it('✅ supervisor should update any header regardless of creation date', async () => {
        if (yesterdayHeaderBostamp) {
          const res = await request(app.getHttpServer())
            .put(`/mdo/headers/${yesterdayHeaderBostamp}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
              obra: 'SUPERVISOR-UPDATED',
              encarregado: 'Supervisor Updated'
            });

          expect(res.status).toBe(200);
        }
      });
    });

    describe('DELETE /mdo/headers/:bostamp - Delete Header', () => {
      it('✅ should delete header on same day', async () => {
        // Create a header to delete
        const createRes = await request(app.getHttpServer())
          .post('/mdo/headers')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            data: new Date().toISOString().split('T')[0],
            obra: 'TO-DELETE-001',
            encarregado: 'To Delete'
          });

        if (createRes.status === 201) {
          const bostampToDelete = createRes.body.bostamp;

          const deleteRes = await request(app.getHttpServer())
            .delete(`/mdo/headers/${bostampToDelete}`)
            .set('Authorization', `Bearer ${userToken}`);

          expect(deleteRes.status).toBe(200);
        }
      });

      it('❌ should fail to delete header from previous day (creation-day lock)', async () => {
        if (yesterdayHeaderBostamp) {
          const res = await request(app.getHttpServer())
            .delete(`/mdo/headers/${yesterdayHeaderBostamp}`)
            .set('Authorization', `Bearer ${userToken}`);

          expect([403, 400]).toContain(res.status);
        }
      });

      it('✅ supervisor should delete any header regardless of creation date', async () => {
        // Create a header with user token
        const createRes = await request(app.getHttpServer())
          .post('/mdo/headers')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            data: new Date().toISOString().split('T')[0],
            obra: 'SUPERVISOR-DELETE-TEST',
            encarregado: 'Supervisor Delete Test'
          });

        if (createRes.status === 201) {
          const bostampToDelete = createRes.body.bostamp;

          // Delete with admin token
          const deleteRes = await request(app.getHttpServer())
            .delete(`/mdo/headers/${bostampToDelete}`)
            .set('Authorization', `Bearer ${adminToken}`);

          expect(deleteRes.status).toBe(200);
        }
      });
    });
  });

  describe('B) Details Controller Tests', () => {
    describe('POST /mdo/details - Create Detail', () => {
      it('✅ should create labor detail (empresa + nfunc)', async () => {
        const res = await request(app.getHttpServer())
          .post('/mdo/details')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            bostamp: createdHeaderBostamp,
            empresa: 'TEST-COMPANY',
            nfunc: '1234567',
            qtt: 8
          });

        expect(res.status).toBe(201);
        expect(res.body.bistamp).toBeDefined();
        expect(res.body.bostamp).toBe(createdHeaderBostamp);
        expect(res.body.empresa).toBe('TEST-COMPANY');
        expect(res.body.nfunc).toBe('1234567');
        expect(res.body.codviat).toBeNull();
        expect(res.body.design).toBeDefined();
        expect(res.body.qtt).toBe(8);

        createdDetailBistamp = res.body.bistamp;
      });

      it('✅ should create equipment detail (codviat)', async () => {
        const res = await request(app.getHttpServer())
          .post('/mdo/details')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            bostamp: createdHeaderBostamp,
            codviat: 'EQ-001',
            qtt: 4
          });

        expect(res.status).toBe(201);
        expect(res.body.bostamp).toBe(createdHeaderBostamp);
        expect(res.body.codviat).toBe('EQ-001');
        expect(res.body.empresa).toBeNull();
        expect(res.body.nfunc).toBeNull();
        expect(res.body.design).toBeDefined();
        expect(res.body.qtt).toBe(4);
      });

      it('❌ should fail when mixing labor + equipment (400)', async () => {
        const res = await request(app.getHttpServer())
          .post('/mdo/details')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            bostamp: createdHeaderBostamp,
            empresa: 'TEST-COMPANY',
            nfunc: '1234567',
            codviat: 'EQ-001',
            qtt: 8
          });

        expect(res.status).toBe(400);
      });

      it('❌ should fail when neither labor nor equipment provided', async () => {
        const res = await request(app.getHttpServer())
          .post('/mdo/details')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            bostamp: createdHeaderBostamp,
            qtt: 8
          });

        expect(res.status).toBe(400);
      });
    });

    describe('GET /mdo/details/:bistamp - Retrieve Detail', () => {
      it('✅ should retrieve detail by bistamp', async () => {
        const res = await request(app.getHttpServer())
          .get(`/mdo/details/${createdDetailBistamp}`)
          .set('Authorization', `Bearer ${userToken}`);

        expect(res.status).toBe(200);
        expect(res.body.bistamp).toBe(createdDetailBistamp);
        expect(res.body.bostamp).toBe(createdHeaderBostamp);
      });
    });

    describe('GET /mdo/details/header/:bostamp - List Header Details', () => {
      it('✅ should return all details for a header', async () => {
        const res = await request(app.getHttpServer())
          .get(`/mdo/details/header/${createdHeaderBostamp}`)
          .set('Authorization', `Bearer ${userToken}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body.every((detail: any) => detail.bostamp === createdHeaderBostamp)).toBe(true);
      });
    });

    describe('PUT /mdo/details/:bistamp - Update Detail', () => {
      it('✅ should update labor detail', async () => {
        const res = await request(app.getHttpServer())
          .put(`/mdo/details/${createdDetailBistamp}`)
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            qtt: 10,
            empresa: 'UPDATED-COMPANY'
          });

        expect(res.status).toBe(200);
        expect(res.body.qtt).toBe(10);
        expect(res.body.empresa).toBe('UPDATED-COMPANY');
      });

      it('✅ should update equipment detail', async () => {
        // First create an equipment detail
        const createRes = await request(app.getHttpServer())
          .post('/mdo/details')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            bostamp: createdHeaderBostamp,
            codviat: 'EQ-UPDATE-TEST',
            qtt: 3
          });

        if (createRes.status === 201) {
          const equipmentBistamp = createRes.body.bistamp;

          const res = await request(app.getHttpServer())
            .put(`/mdo/details/${equipmentBistamp}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({
              qtt: 6,
              codviat: 'EQ-UPDATED'
            });

          expect(res.status).toBe(200);
          expect(res.body.qtt).toBe(6);
          expect(res.body.codviat).toBe('EQ-UPDATED');
        }
      });
    });

    describe('DELETE /mdo/details/:bistamp - Delete Detail', () => {
      it('✅ should delete detail', async () => {
        // Create a detail to delete
        const createRes = await request(app.getHttpServer())
          .post('/mdo/details')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            bostamp: createdHeaderBostamp,
            empresa: 'TO-DELETE-COMPANY',
            nfunc: '9999999',
            qtt: 2
          });

        if (createRes.status === 201) {
          const bistampToDelete = createRes.body.bistamp;

          const deleteRes = await request(app.getHttpServer())
            .delete(`/mdo/details/${bistampToDelete}`)
            .set('Authorization', `Bearer ${userToken}`);

          expect(deleteRes.status).toBe(200);
        }
      });
    });
  });

  describe('D) Autocomplete Tests', () => {
    describe('GET /mdo/obras/search - Obras Search', () => {
      it('✅ should return only obras with situacao starting with 3,4,5,7', async () => {
        const res = await request(app.getHttpServer())
          .get('/mdo/obras/search?q=TEST')
          .set('Authorization', `Bearer ${userToken}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        
        // Verify all returned obras have valid situacao
        res.body.forEach((obra: any) => {
          if (obra.situacao) {
            const firstChar = obra.situacao.toString()[0];
            expect(['3', '4', '5', '7']).toContain(firstChar);
          }
        });
      });
    });

    describe('GET /mdo/equipamentos/search - Equipamentos Search', () => {
      it('✅ should return only active equipamentos (inactivo = 0)', async () => {
        const res = await request(app.getHttpServer())
          .get('/mdo/equipamentos/search?q=EQ')
          .set('Authorization', `Bearer ${userToken}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        
        // Verify all returned equipamentos are active
        res.body.forEach((equipamento: any) => {
          expect(equipamento.inactivo).toBe(0);
        });
      });
    });
  });

  describe('E) Validation and Edge Cases', () => {
    describe('bostamp/bistamp Validation', () => {
      it('✅ should maintain valid bostamp format', async () => {
        const res = await request(app.getHttpServer())
          .post('/mdo/headers')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            data: new Date().toISOString().split('T')[0],
            obra: 'BOSTAMP-TEST',
            encarregado: 'Bostamp Test'
          });

        expect(res.status).toBe(201);
        expect(res.body.bostamp).toMatch(/^MDOAPP[H|D]-/);
        expect(typeof res.body.bostamp).toBe('string');
        expect(res.body.bostamp.length).toBeGreaterThan(10);
      });

      it('✅ should maintain valid bistamp format', async () => {
        const res = await request(app.getHttpServer())
          .post('/mdo/details')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            bostamp: createdHeaderBostamp,
            empresa: 'BISTAMP-TEST',
            nfunc: '8888888',
            qtt: 5
          });

        expect(res.status).toBe(201);
        expect(res.body.bistamp).toMatch(/^MDOAPP[H|D]-/);
        expect(typeof res.body.bistamp).toBe('string');
        expect(res.body.bistamp.length).toBeGreaterThan(10);
      });
    });

    describe('Auto-fill Design Field', () => {
      it('✅ should auto-fill design from employee.fullName for labor', async () => {
        const res = await request(app.getHttpServer())
          .post('/mdo/details')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            bostamp: createdHeaderBostamp,
            empresa: 'AUTO-FILL-TEST',
            nfunc: '1234567',
            qtt: 7
          });

        expect(res.status).toBe(201);
        expect(res.body.design).toBeDefined();
        expect(res.body.design).not.toBe('');
      });

      it('✅ should auto-fill design from equipamento.desig for equipment', async () => {
        const res = await request(app.getHttpServer())
          .post('/mdo/details')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            bostamp: createdHeaderBostamp,
            codviat: 'EQ-AUTO-FILL',
            qtt: 3
          });

        expect(res.status).toBe(201);
        expect(res.body.design).toBeDefined();
        expect(res.body.design).not.toBe('');
      });
    });
  });
});