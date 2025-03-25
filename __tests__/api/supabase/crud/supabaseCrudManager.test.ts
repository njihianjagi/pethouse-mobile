import { supabase } from '../../../../api/supabase/client';
import crudManager from '../../../../api/supabase/crud/supabaseCrudManager';
import { ErrorCode } from '../../../../utils/ErrorCode';

jest.mock('../../../../api/supabase/client');

describe('supabaseCrudManager', () => {
    const mockTable = 'test_table';
    const mockId = 'test-id';
    const mockData = { name: 'test', value: 123 };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should successfully create a record', async () => {
            const mockResponse = { data: mockData, error: null };
            (supabase.from as jest.Mock).mockReturnValue({
                insert: jest.fn().mockReturnValue({
                    select: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue(mockResponse),
                    }),
                }),
            });

            const result = await crudManager.create(mockTable, mockData);

            expect(result).toEqual({ data: mockData });
            expect(supabase.from).toHaveBeenCalledWith(mockTable);
        });

        it('should handle errors during creation', async () => {
            const mockError = new Error('Database error');
            (supabase.from as jest.Mock).mockReturnValue({
                insert: jest.fn().mockReturnValue({
                    select: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({ data: null, error: mockError }),
                    }),
                }),
            });

            const result = await crudManager.create(mockTable, mockData);

            expect(result).toEqual({ error: ErrorCode.serverError });
        });
    });

    describe('read', () => {
        it('should successfully read a record', async () => {
            const mockResponse = { data: mockData, error: null };
            (supabase.from as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue(mockResponse),
                    }),
                }),
            });

            const result = await crudManager.read(mockTable, mockId);

            expect(result).toEqual({ data: mockData });
            expect(supabase.from).toHaveBeenCalledWith(mockTable);
        });

        it('should handle errors during read', async () => {
            const mockError = new Error('Database error');
            (supabase.from as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({ data: null, error: mockError }),
                    }),
                }),
            });

            const result = await crudManager.read(mockTable, mockId);

            expect(result).toEqual({ error: ErrorCode.serverError });
        });
    });

    describe('update', () => {
        it('should successfully update a record', async () => {
            const mockResponse = { data: mockData, error: null };
            (supabase.from as jest.Mock).mockReturnValue({
                update: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        select: jest.fn().mockReturnValue({
                            single: jest.fn().mockResolvedValue(mockResponse),
                        }),
                    }),
                }),
            });

            const result = await crudManager.update(mockTable, mockId, mockData);

            expect(result).toEqual({ data: mockData });
            expect(supabase.from).toHaveBeenCalledWith(mockTable);
        });

        it('should handle errors during update', async () => {
            const mockError = new Error('Database error');
            (supabase.from as jest.Mock).mockReturnValue({
                update: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        select: jest.fn().mockReturnValue({
                            single: jest.fn().mockResolvedValue({ data: null, error: mockError }),
                        }),
                    }),
                }),
            });

            const result = await crudManager.update(mockTable, mockId, mockData);

            expect(result).toEqual({ error: ErrorCode.serverError });
        });
    });

    describe('remove', () => {
        it('should successfully remove a record', async () => {
            const mockResponse = { error: null };
            (supabase.from as jest.Mock).mockReturnValue({
                delete: jest.fn().mockReturnValue({
                    eq: jest.fn().mockResolvedValue(mockResponse),
                }),
            });

            const result = await crudManager.remove(mockTable, mockId);

            expect(result).toEqual({ success: true });
            expect(supabase.from).toHaveBeenCalledWith(mockTable);
        });

        it('should handle errors during removal', async () => {
            const mockError = new Error('Database error');
            (supabase.from as jest.Mock).mockReturnValue({
                delete: jest.fn().mockReturnValue({
                    eq: jest.fn().mockResolvedValue({ error: mockError }),
                }),
            });

            const result = await crudManager.remove(mockTable, mockId);

            expect(result).toEqual({ error: ErrorCode.serverError });
        });
    });

    describe('list', () => {
        it('should successfully list records with filters', async () => {
            const mockResponse = { data: [mockData], error: null };
            const mockQuery = {
                filters: { status: 'active' },
                page: 1,
                limit: 10,
                orderBy: 'created_at',
                ascending: true,
            };

            (supabase.from as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                range: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue(mockResponse),
            });

            const result = await crudManager.list(mockTable, mockQuery);

            expect(result).toEqual({ data: [mockData] });
            expect(supabase.from).toHaveBeenCalledWith(mockTable);
        });

        it('should handle errors during listing', async () => {
            const mockError = new Error('Database error');
            (supabase.from as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                range: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({ data: null, error: mockError }),
            });

            const result = await crudManager.list(mockTable);

            expect(result).toEqual({ error: ErrorCode.serverError });
        });
    });
}); 