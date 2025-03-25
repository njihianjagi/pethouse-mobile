import { supabase } from '../../../../api/supabase/client';
import userCrudManager from '../../../../api/supabase/users/userCrudManager';
import { ErrorCode } from '../../../../utils/ErrorCode';

jest.mock('../../../../api/supabase/client');

describe('userCrudManager', () => {
    const mockUserId = 'test-user-id';
    const mockUserData = {
        id: mockUserId,
        username: 'testuser',
        email: 'test@example.com',
        full_name: 'Test User',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createUser', () => {
        it('should successfully create a user', async () => {
            const mockResponse = { data: mockUserData, error: null };
            const mockFrom = jest.fn().mockReturnValue({
                insert: jest.fn().mockReturnValue({
                    select: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue(mockResponse),
                    }),
                }),
            });
            (supabase.from as jest.Mock).mockImplementation(mockFrom);

            const result = await userCrudManager.createUser(mockUserData);

            expect(result).toEqual({ data: mockUserData });
            expect(mockFrom).toHaveBeenCalledWith('users');
        });
    });

    describe('getUser', () => {
        it('should successfully get a user by ID', async () => {
            const mockResponse = { data: mockUserData, error: null };
            const mockFrom = jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue(mockResponse),
                    }),
                }),
            });
            (supabase.from as jest.Mock).mockImplementation(mockFrom);

            const result = await userCrudManager.getUser(mockUserId);

            expect(result).toEqual({ data: mockUserData });
            expect(mockFrom).toHaveBeenCalledWith('users');
        });
    });

    describe('getUserByUsername', () => {
        it('should successfully get a user by username', async () => {
            const mockResponse = { data: mockUserData, error: null };
            const mockSelect = jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue(mockResponse),
                }),
            });
            const mockFrom = jest.fn().mockReturnValue({
                select: mockSelect,
            });
            (supabase.from as jest.Mock).mockImplementation(mockFrom);

            const result = await userCrudManager.getUserByUsername('testuser');

            expect(result).toEqual({ data: mockUserData });
            expect(mockFrom).toHaveBeenCalledWith('users');
            expect(mockSelect).toHaveBeenCalledWith('*');
            expect(mockSelect().eq).toHaveBeenCalledWith('username', 'testuser');
        });

        it('should handle errors when getting user by username', async () => {
            const mockError = new Error('Database error');
            const mockSelect = jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({ data: null, error: mockError }),
                }),
            });
            const mockFrom = jest.fn().mockReturnValue({
                select: mockSelect,
            });
            (supabase.from as jest.Mock).mockImplementation(mockFrom);

            const result = await userCrudManager.getUserByUsername('testuser');

            expect(result).toEqual({ error: ErrorCode.serverError });
        });
    });

    describe('getUserByEmail', () => {
        it('should successfully get a user by email', async () => {
            const mockResponse = { data: mockUserData, error: null };
            const mockSelect = jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue(mockResponse),
                }),
            });
            const mockFrom = jest.fn().mockReturnValue({
                select: mockSelect,
            });
            (supabase.from as jest.Mock).mockImplementation(mockFrom);

            const result = await userCrudManager.getUserByEmail('test@example.com');

            expect(result).toEqual({ data: mockUserData });
            expect(mockFrom).toHaveBeenCalledWith('users');
            expect(mockSelect).toHaveBeenCalledWith('*');
            expect(mockSelect().eq).toHaveBeenCalledWith('email', 'test@example.com');
        });

        it('should handle errors when getting user by email', async () => {
            const mockError = new Error('Database error');
            const mockSelect = jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({ data: null, error: mockError }),
                }),
            });
            const mockFrom = jest.fn().mockReturnValue({
                select: mockSelect,
            });
            (supabase.from as jest.Mock).mockImplementation(mockFrom);

            const result = await userCrudManager.getUserByEmail('test@example.com');

            expect(result).toEqual({ error: ErrorCode.serverError });
        });
    });

    describe('updateUserProfile', () => {
        it('should successfully update a user profile', async () => {
            const mockResponse = { data: mockUserData, error: null };
            const profileData = { full_name: 'Updated Name' };
            const mockUpdate = jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    select: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue(mockResponse),
                    }),
                }),
            });
            const mockFrom = jest.fn().mockReturnValue({
                update: mockUpdate,
            });
            (supabase.from as jest.Mock).mockImplementation(mockFrom);

            const result = await userCrudManager.updateUserProfile(mockUserId, profileData);

            expect(result).toEqual({ data: mockUserData });
            expect(mockFrom).toHaveBeenCalledWith('users');
            expect(mockUpdate).toHaveBeenCalledWith(profileData);
            expect(mockUpdate().eq).toHaveBeenCalledWith('id', mockUserId);
        });

        it('should handle errors when updating user profile', async () => {
            const mockError = new Error('Database error');
            const profileData = { full_name: 'Updated Name' };
            const mockUpdate = jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    select: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({ data: null, error: mockError }),
                    }),
                }),
            });
            const mockFrom = jest.fn().mockReturnValue({
                update: mockUpdate,
            });
            (supabase.from as jest.Mock).mockImplementation(mockFrom);

            const result = await userCrudManager.updateUserProfile(mockUserId, profileData);

            expect(result).toEqual({ error: ErrorCode.serverError });
        });
    });
}); 