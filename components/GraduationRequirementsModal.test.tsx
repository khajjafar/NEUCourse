import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GraduationRequirementsModal from './GraduationRequirementsModal';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('GraduationRequirementsModal', () => {
    const mockUpdateRequirements = vi.fn().mockResolvedValue(true);
    const mockOnClose = vi.fn();

    const mockRequirements = [
        { id: 'req1', name: 'Electives', count: 4 },
        { id: 'req2', name: 'GenEds', count: 2 }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders nothing when not open', () => {
        const { container } = render(
            <GraduationRequirementsModal
                isOpen={false}
                onClose={mockOnClose}
                requirements={mockRequirements}
                updateRequirements={mockUpdateRequirements}
            />
        );
        expect(container.innerHTML).toBe('');
    });

    it('renders existing requirements when open', () => {
        render(
            <GraduationRequirementsModal
                isOpen={true}
                onClose={mockOnClose}
                requirements={mockRequirements}
                updateRequirements={mockUpdateRequirements}
            />
        );

        expect(screen.getByText('Graduation Requirements')).toBeInTheDocument();
        expect(screen.getByText('Electives')).toBeInTheDocument();
        expect(screen.getByText('4 required')).toBeInTheDocument();
        expect(screen.getByText('GenEds')).toBeInTheDocument();
        expect(screen.getByText('2 required')).toBeInTheDocument();
    });

    it('adds a new requirement', async () => {
        render(
            <GraduationRequirementsModal
                isOpen={true}
                onClose={mockOnClose}
                requirements={mockRequirements}
                updateRequirements={mockUpdateRequirements}
            />
        );

        const nameInput = screen.getByPlaceholderText('e.g. Electives, GenEd');
        const countInput = screen.getByPlaceholderText('Count');
        const addButton = screen.getByRole('button', { name: /Add/i });

        fireEvent.change(nameInput, { target: { value: 'Major Cores' } });
        fireEvent.change(countInput, { target: { value: '10' } });
        fireEvent.click(addButton);

        expect(screen.getByText('Major Cores')).toBeInTheDocument();
        expect(screen.getByText('10 required')).toBeInTheDocument();
    });

    it('removes a requirement', async () => {
        render(
            <GraduationRequirementsModal
                isOpen={true}
                onClose={mockOnClose}
                requirements={mockRequirements}
                updateRequirements={mockUpdateRequirements}
            />
        );

        expect(screen.getByText('Electives')).toBeInTheDocument();

        const deleteButtons = screen.getAllByTitle('Remove requirement');
        fireEvent.click(deleteButtons[0]);

        await waitFor(() => {
            expect(screen.queryByText('Electives')).not.toBeInTheDocument();
        });
    });

    it('saves changes and calls updateRequirements', async () => {
        render(
            <GraduationRequirementsModal
                isOpen={true}
                onClose={mockOnClose}
                requirements={mockRequirements}
                updateRequirements={mockUpdateRequirements}
            />
        );

        const nameInput = screen.getByPlaceholderText('e.g. Electives, GenEd');
        const countInput = screen.getByPlaceholderText('Count');
        const addButton = screen.getByRole('button', { name: /Add/i });

        fireEvent.change(nameInput, { target: { value: 'New Req' } });
        fireEvent.change(countInput, { target: { value: '5' } });
        fireEvent.click(addButton);

        const saveButton = screen.getByRole('button', { name: /Save Changes/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(mockUpdateRequirements).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({ name: 'Electives', count: 4 }),
                    expect.objectContaining({ name: 'GenEds', count: 2 }),
                    expect.objectContaining({ name: 'New Req', count: 5 })
                ])
            );
            expect(mockOnClose).toHaveBeenCalled();
        });
    });
});
